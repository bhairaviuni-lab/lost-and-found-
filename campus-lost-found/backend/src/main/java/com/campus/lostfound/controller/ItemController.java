package com.campus.lostfound.controller;

import com.campus.lostfound.model.Item;
import com.campus.lostfound.model.User;
import com.campus.lostfound.repository.ItemRepository;
import com.campus.lostfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    // GET /api/items?search=&type=&category=&status=
    @GetMapping
    public ResponseEntity<List<Item>> getAllItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {

        Item.ItemType itemType = null;
        if (type != null && !type.equalsIgnoreCase("ALL")) {
            try { itemType = Item.ItemType.valueOf(type.toUpperCase()); } catch (Exception ignored) {}
        }

        Item.ItemStatus itemStatus = null;
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            try { itemStatus = Item.ItemStatus.valueOf(status.toUpperCase()); } catch (Exception ignored) {}
        }

        List<Item> results = itemRepository.searchItems(itemType,
                (category == null || category.equalsIgnoreCase("ALL")) ? null : category,
                itemStatus,
                (search == null || search.trim().isEmpty()) ? null : search.trim());

        return ResponseEntity.ok(results);
    }

    // GET /api/items/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Long id) {
        Optional<Item> item = itemRepository.findById(id);
        if (item.isPresent()) {
            return ResponseEntity.ok(item.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Item report not found."));
    }

    // POST /api/items (Report Lost or Found Item)
    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody Map<String, Object> payload, @RequestHeader("X-User-Id") Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid user credentials."));
        }

        User user = userOpt.get();
        String typeStr = (String) payload.get("type");
        Item.ItemType type = Item.ItemType.valueOf(typeStr.toUpperCase());

        Item item = new Item();
        item.setUser(user);
        item.setItemName((String) payload.get("itemName"));
        item.setType(type);
        item.setCategory((String) payload.get("category"));
        item.setDescription((String) payload.get("description"));
        item.setEventDate(LocalDate.parse((String) payload.get("date")));
        item.setApproxTime((String) payload.get("time"));
        item.setLocation((String) payload.get("location"));
        item.setColor((String) payload.get("color"));
        item.setBrand((String) payload.get("brand"));
        item.setIdentifyingDetails((String) payload.get("identifyingDetails"));
        item.setImageUrl((String) payload.get("imageUrl"));
        item.setStatus(Item.ItemStatus.OPEN);

        String randomSuffix = String.format("%04d", new Random().nextInt(10000));
        item.setReportId(type.name() + "-" + LocalDate.now().getYear() + "-" + randomSuffix);

        Item saved = itemRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", type.name() + " item reported successfully!",
            "item", saved
        ));
    }

    // PUT /api/items/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody Map<String, Object> payload, @RequestHeader("X-User-Id") Long userId) {
        Optional<Item> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        Item item = itemOpt.get();
        if (!item.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You can only edit your own reports."));
        }

        if (payload.containsKey("itemName")) item.setItemName((String) payload.get("itemName"));
        if (payload.containsKey("description")) item.setDescription((String) payload.get("description"));
        if (payload.containsKey("location")) item.setLocation((String) payload.get("location"));
        if (payload.containsKey("status")) item.setStatus(Item.ItemStatus.valueOf(((String) payload.get("status")).toUpperCase()));

        Item updated = itemRepository.save(item);
        return ResponseEntity.ok(Map.of("message", "Report updated successfully.", "item", updated));
    }

    // DELETE /api/items/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        Optional<Item> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) return ResponseEntity.notFound().build();

        Item item = itemOpt.get();
        if (!item.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You can only delete your own reports."));
        }

        itemRepository.delete(item);
        return ResponseEntity.ok(Map.of("message", "Report deleted successfully."));
    }
}
