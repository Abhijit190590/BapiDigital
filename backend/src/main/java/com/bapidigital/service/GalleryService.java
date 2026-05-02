package com.bapidigital.service;

import com.bapidigital.model.GalleryImage;
import com.bapidigital.repository.GalleryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GalleryService {
    @Autowired
    private GalleryRepository galleryRepository;

    public List<GalleryImage> getAllImages() {
        return galleryRepository.findAll();
    }

    public GalleryImage uploadImage(GalleryImage image) {
        return galleryRepository.save(image);
    }

    public void deleteImage(String id) {
        galleryRepository.deleteById(id);
    }
}
