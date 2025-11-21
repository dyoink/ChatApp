package com.example.BackEnd.controller;

import com.example.BackEnd.dto.*;
import com.example.BackEnd.dto.RoomMemberResponse;
import com.example.BackEnd.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(@Valid @RequestBody RoomCreateRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            RoomResponse room = roomService.createRoom(email, request);
            return ResponseEntity.ok(ApiResponse.success("Room created successfully", room));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<RoomResponse>> joinRoom(@Valid @RequestBody RoomJoinRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            RoomResponse room = roomService.joinRoom(email, request);
            return ResponseEntity.ok(ApiResponse.success("Joined room successfully", room));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@RequestParam Long roomId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            roomService.deleteRoom(email, roomId);
            return ResponseEntity.ok(ApiResponse.success("Room deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<RoomSearchResponse>> searchRooms(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            RoomSearchResponse result = roomService.searchRooms(query, page, size);
            return ResponseEntity.ok(ApiResponse.success("Rooms fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/kick")
    public ResponseEntity<ApiResponse<Void>> kickMember(@RequestParam Long roomId, @RequestParam Long userId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            roomService.kickMember(email, roomId, userId);
            return ResponseEntity.ok(ApiResponse.success("User kicked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{roomId}/members")
    public ResponseEntity<ApiResponse<List<RoomMemberResponse>>> getRoomMembers(@PathVariable Long roomId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            List<RoomMemberResponse> members = roomService.getRoomMembers(email, roomId);
            return ResponseEntity.ok(ApiResponse.success("Room members fetched successfully", members));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(@PathVariable Long roomId) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            RoomResponse room = roomService.getRoomById(email, roomId);
            return ResponseEntity.ok(ApiResponse.success("Room details fetched successfully", room));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<RoomSearchResponse>> getUserRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            RoomSearchResponse result = roomService.getUserRooms(email, page, size);
            return ResponseEntity.ok(ApiResponse.success("User rooms fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/user/ids")
    public ResponseEntity<ApiResponse<List<Long>>> getUserRoomIds() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            List<Long> roomIds = roomService.getUserRoomIds(email);
            return ResponseEntity.ok(ApiResponse.success("User room IDs fetched successfully", roomIds));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/own")
    public ResponseEntity<ApiResponse<RoomSearchResponse>> getOwnRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            RoomSearchResponse result = roomService.getOwnRooms(email, page, size);
            return ResponseEntity.ok(ApiResponse.success("User own rooms fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}