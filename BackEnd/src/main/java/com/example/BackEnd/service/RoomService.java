package com.example.BackEnd.service;

import com.example.BackEnd.dto.*;
import java.util.List;

public interface RoomService {
    RoomResponse createRoom(String creatorEmail, RoomCreateRequest request);

    RoomResponse joinRoom(String userEmail, RoomJoinRequest request);

    void deleteRoom(String userEmail, Long roomId);

    RoomSearchResponse searchRooms(String query, int page, int size);

    void kickMember(String userEmail, Long roomId, Long userIdToKick);

    List<RoomMemberResponse> getRoomMembers(String userEmail, Long roomId);

    RoomResponse getRoomById(String userEmail, Long roomId);

    RoomSearchResponse getUserRooms(String userEmail, int page, int size);

    List<Long> getUserRoomIds(String userEmail);

    RoomSearchResponse getOwnRooms(String userEmail, int page, int size);
}