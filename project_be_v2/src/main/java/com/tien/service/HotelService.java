package com.tien.service;

import java.util.List;

import com.tien.dto.response.HotelResponseDTO;

public interface HotelService {
    List<HotelResponseDTO> getAllHotels();

    List<HotelResponseDTO> getHotelsByCity(String city);

    List<HotelResponseDTO> searchHotels(String keyword);

    HotelResponseDTO getHotelById(Integer hotelId);
}
