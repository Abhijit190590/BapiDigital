package com.bapidigital.controller;

import com.bapidigital.model.GalleryImage;
import com.bapidigital.service.GalleryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/gallery")
public class GalleryController {
    @Autowired
    private GalleryService galleryService;

    @GetMapping
    public ResponseEntity<List<GalleryImage>> getGallery() {
        return ResponseEntity.ok(galleryService.getAllImages());
    }

    @PostMapping("/admin/upload")
    public ResponseEntity<GalleryImage> uploadImage(@RequestBody GalleryImage image) {
        return ResponseEntity.ok(galleryService.uploadImage(image));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable String id) {
        galleryService.deleteImage(id);
        return ResponseEntity.ok().build();
    }
}
