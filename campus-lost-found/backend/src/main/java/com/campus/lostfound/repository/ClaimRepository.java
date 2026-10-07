package com.campus.lostfound.repository;

import com.campus.lostfound.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByItemId(Long itemId);
    List<Claim> findByClaimantIdOrderByCreatedAtDesc(Long claimantId);
    List<Claim> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    long countByStatus(Claim.ClaimStatus status);
}
