package com.campus.lostfound.controller;

import com.campus.lostfound.model.Claim;
import com.campus.lostfound.model.Item;
import com.campus.lostfound.model.User;
import com.campus.lostfound.repository.ClaimRepository;
import com.campus.lostfound.repository.ItemRepository;
import com.campus.lostfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    // POST /api/items/{itemId}/claims
    @PostMapping("/items/{itemId}")
    public ResponseEntity<?> createClaim(
            @PathVariable Long itemId,
            @RequestBody Map<String, String> payload,
            @RequestHeader("X-User-Id") Long claimantId) {

        Optional<Item> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        Optional<User> claimantOpt = userRepository.findById(claimantId);
        if (claimantOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Item item = itemOpt.get();
        User claimant = claimantOpt.get();

        if (item.getUser().getId().equals(claimantId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot claim an item you reported yourself."));
        }

        Claim claim = new Claim();
        claim.setItem(item);
        claim.setClaimant(claimant);
        claim.setOwner(item.getUser());
        claim.setReason(payload.get("reason"));
        claim.setAdditionalDetails(payload.get("additionalDetails"));
        claim.setProofDetails(payload.get("proofDetails"));
        claim.setStatus(Claim.ClaimStatus.PENDING);

        Claim saved = claimRepository.save(claim);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Claim submitted successfully!",
            "claim", saved
        ));
    }

    // PUT /api/claims/{id}/accept
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptClaim(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        Optional<Claim> claimOpt = claimRepository.findById(id);
        if (claimOpt.isEmpty()) return ResponseEntity.notFound().build();

        Claim claim = claimOpt.get();
        if (!claim.getOwner().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only the item owner can accept claims."));
        }

        claim.setStatus(Claim.ClaimStatus.ACCEPTED);
        Claim updated = claimRepository.save(claim);

        // Mark item as resolved/returned
        Item item = claim.getItem();
        item.setStatus(Item.ItemStatus.RESOLVED);
        itemRepository.save(item);

        return ResponseEntity.ok(Map.of(
            "message", "Claim accepted! Item marked as Resolved / Returned.",
            "claim", updated
        ));
    }

    // PUT /api/claims/{id}/reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectClaim(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        Optional<Claim> claimOpt = claimRepository.findById(id);
        if (claimOpt.isEmpty()) return ResponseEntity.notFound().build();

        Claim claim = claimOpt.get();
        if (!claim.getOwner().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only the item owner can reject claims."));
        }

        claim.setStatus(Claim.ClaimStatus.REJECTED);
        Claim updated = claimRepository.save(claim);

        return ResponseEntity.ok(Map.of(
            "message", "Claim rejected.",
            "claim", updated
        ));
    }
}
