package com.campus.lostfound.controller;

import com.campus.lostfound.dto.AuthDTOs;
import com.campus.lostfound.model.Item;
import com.campus.lostfound.repository.ItemRepository;
import com.campus.lostfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<AuthDTOs.StatsResponse> getStats() {
        long totalLost = itemRepository.countByType(Item.ItemType.LOST);
        long totalFound = itemRepository.countByType(Item.ItemType.FOUND);
        long itemsReunited = itemRepository.countByStatus(Item.ItemStatus.RESOLVED);
        long activeItems = itemRepository.countByStatus(Item.ItemStatus.OPEN);
        long totalUsers = userRepository.count();

        return ResponseEntity.ok(new AuthDTOs.StatsResponse(
            totalLost, totalFound, itemsReunited, activeItems, totalUsers
        ));
    }
}
