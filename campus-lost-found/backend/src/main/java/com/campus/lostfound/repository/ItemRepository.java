package com.campus.lostfound.repository;

import com.campus.lostfound.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByReportId(String reportId);
    List<Item> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Item> findByTypeOrderByCreatedAtDesc(Item.ItemType type);
    List<Item> findByStatusOrderByCreatedAtDesc(Item.ItemStatus status);

    @Query("SELECT i FROM Item i WHERE " +
           "(:type IS NULL OR i.type = :type) AND " +
           "(:category IS NULL OR LOWER(i.category) = LOWER(:category)) AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:search IS NULL OR LOWER(i.itemName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.brand) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY i.createdAt DESC")
    List<Item> searchItems(
        @Param("type") Item.ItemType type,
        @Param("category") String category,
        @Param("status") Item.ItemStatus status,
        @Param("search") String search
    );

    long countByType(Item.ItemType type);
    long countByStatus(Item.ItemStatus status);
}
