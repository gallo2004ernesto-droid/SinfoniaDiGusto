package com.it.unical.progetto.sinfoniadigusto.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.it.unical.progetto.sinfoniadigusto.DTO.CouponDTOs.CouponRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.CouponDTOs.CouponResponse;
import com.it.unical.progetto.sinfoniadigusto.DTO.CouponDTOs.CouponValidateRequest;
import com.it.unical.progetto.sinfoniadigusto.DTO.CouponDTOs.CouponValidationResponse;
import com.it.unical.progetto.sinfoniadigusto.DTO.OrderDTOs.OrderItemRequest;
import com.it.unical.progetto.sinfoniadigusto.exception.BadRequestException;
import com.it.unical.progetto.sinfoniadigusto.exception.ResourceNotFoundException;
import com.it.unical.progetto.sinfoniadigusto.model.Coupon;
import com.it.unical.progetto.sinfoniadigusto.model.DiscountType;
import com.it.unical.progetto.sinfoniadigusto.model.Product;
import com.it.unical.progetto.sinfoniadigusto.repository.CouponRepository;
import com.it.unical.progetto.sinfoniadigusto.repository.ProductRepository;

@Service
public class CouponService {

    private static final Pattern CODE_PATTERN = Pattern.compile("^[A-Z0-9_-]{3,30}$");

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAllByOrderByIdDesc().stream()
                .map(CouponService::toResponse)
                .toList();
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        String code = normalizeCode(request.code());
        validateRequest(request, code);

        if (couponRepository.existsByCode(code)) {
            throw new BadRequestException("Esiste già un codice sconto con questo nome.");
        }

        Coupon coupon = new Coupon();
        apply(coupon, request, code);
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Codice sconto non trovato con ID: " + id));

        String code = normalizeCode(request.code());
        validateRequest(request, code);

        // Dopo il primo utilizzo il codice resta quello usato negli ordini
        if (coupon.getUsedCount() > 0 && !coupon.getCode().equals(code)) {
            throw new BadRequestException("Il codice non si può cambiare dopo il primo utilizzo.");
        }

        if (couponRepository.existsByCodeAndIdNot(code, id)) {
            throw new BadRequestException("Esiste già un altro codice sconto con questo nome.");
        }

        apply(coupon, request, code);
        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Codice sconto non trovato con ID: " + id);
        }
        couponRepository.deleteById(id);
    }

    // CHECKOUT: ANTEPRIMA SCONTO
    @Transactional(readOnly = true)
    public CouponValidationResponse validate(CouponValidateRequest request) {

        if (request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException("Il carrello è vuoto.");
        }

        // Il subtotale si ricalcola dai prezzi nel database
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest item : request.items()) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Prodotto non trovato con ID: " + item.productId()));

            subtotal = subtotal.add(
                    product.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
        }

        Coupon coupon = getUsableCoupon(request.code(), subtotal);
        BigDecimal discount = calculateDiscount(coupon, subtotal);

        return new CouponValidationResponse(
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                subtotal,
                discount,
                subtotal.subtract(discount)
        );
    }
   
    // Restituisce il coupon se è utilizzabile, altrimenti lancia un errore leggibile
    public Coupon getUsableCoupon(String rawCode, BigDecimal subtotal) {

        if (rawCode == null || rawCode.isBlank()) {
            throw new BadRequestException("Inserisci un codice sconto.");
        }

        Coupon coupon = couponRepository.findByCode(normalizeCode(rawCode))
                .orElseThrow(() -> new BadRequestException("Codice sconto non valido."));

        switch (computeStatus(coupon)) {
            case "DISABLED" ->
                throw new BadRequestException("Questo codice sconto non è attivo.");
            case "EXPIRED" ->
                throw new BadRequestException("Questo codice sconto è scaduto.");
            case "SCHEDULED" ->
                throw new BadRequestException("Questo codice sconto non è ancora valido.");
            case "EXHAUSTED" ->
                throw new BadRequestException("Questo codice sconto ha esaurito gli utilizzi.");
            default -> {
            }
        }

        BigDecimal min = coupon.getMinOrderAmount();

        if (min != null && subtotal.compareTo(min) < 0) {
            throw new BadRequestException(
                    "Questo codice richiede un ordine minimo di € "
                    + min.setScale(2, RoundingMode.HALF_UP).toPlainString().replace('.', ',')
                    + ".");
        }

        return coupon;
    }

    // Importo dello sconto, mai superiore al subtotale
    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {

        BigDecimal discount;

        if (coupon.getDiscountType() == DiscountType.PERCENT) {
            discount = subtotal
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getDiscountValue();
        }

        return discount.min(subtotal).setScale(2, RoundingMode.HALF_UP);
    }

    public static String computeStatus(Coupon c) {
        LocalDate today = LocalDate.now();

        if (!c.isActive()) {
            return "DISABLED";
        }
        if (c.getValidUntil() != null && today.isAfter(c.getValidUntil())) {
            return "EXPIRED";
        }
        if (c.getValidFrom() != null && today.isBefore(c.getValidFrom())) {
            return "SCHEDULED";
        }
        if (c.getUsageLimit() != null && c.getUsedCount() >= c.getUsageLimit()) {
            return "EXHAUSTED";
        }
        return "ACTIVE";
    }


    // HELPER
    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new BadRequestException("Il codice è obbligatorio.");
        }
        return code.trim().toUpperCase().replaceAll("\\s+", "");
    }

    private void validateRequest(CouponRequest r, String code) {

        if (!CODE_PATTERN.matcher(code).matches()) {
            throw new BadRequestException(
                    "Il codice deve avere da 3 a 30 caratteri: lettere, numeri, trattino o underscore.");
        }
        if (r.discountType() == null) {
            throw new BadRequestException("Scegli il tipo di sconto.");
        }
        if (r.discountValue() == null || r.discountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Il valore dello sconto deve essere maggiore di zero.");
        }
        if (r.discountType() == DiscountType.PERCENT
                && r.discountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException("Lo sconto percentuale non può superare il 100%.");
        }
        if (r.minOrderAmount() != null && r.minOrderAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("L'ordine minimo non può essere negativo.");
        }
        if (r.validFrom() != null && r.validUntil() != null
                && r.validUntil().isBefore(r.validFrom())) {
            throw new BadRequestException("La data di fine non può precedere quella di inizio.");
        }
        if (r.usageLimit() != null && r.usageLimit() < 1) {
            throw new BadRequestException("Il limite di utilizzi deve essere almeno 1.");
        }
    }

    private void apply(Coupon coupon, CouponRequest r, String code) {
        coupon.setCode(code);
        coupon.setDescription(
                r.description() != null && !r.description().isBlank()
                ? r.description().trim()
                : null);
        coupon.setDiscountType(r.discountType());
        coupon.setDiscountValue(r.discountValue().setScale(2, RoundingMode.HALF_UP));
        coupon.setMinOrderAmount(r.minOrderAmount());
        coupon.setValidFrom(r.validFrom());
        coupon.setValidUntil(r.validUntil());
        coupon.setUsageLimit(r.usageLimit());
        coupon.setActive(r.active() == null || r.active());
    }

    // Registra un utilizzo del coupon (rispetta il limite anche con ordini simultanei)
    @Transactional
    public void registerUsage(Coupon coupon) {
        if (couponRepository.incrementUsage(coupon.getId()) == 0) {
            throw new BadRequestException("Questo codice sconto ha esaurito gli utilizzi.");
        }
    }

    @Transactional
    public void releaseUsage(String code) {
        if (code != null && !code.isBlank()) {
            couponRepository.decrementUsageByCode(code);
        }
    }

    private static CouponResponse toResponse(Coupon c) {
        return new CouponResponse(
                c.getId(),
                c.getCode(),
                c.getDescription(),
                c.getDiscountType(),
                c.getDiscountValue(),
                c.getMinOrderAmount(),
                c.getValidFrom(),
                c.getValidUntil(),
                c.getUsageLimit(),
                c.getUsedCount(),
                c.isActive(),
                computeStatus(c)
        );
    }
}
