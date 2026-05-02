package com.bapidigital.repository;

import com.bapidigital.model.GalleryImage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GalleryRepository extends MongoRepository<GalleryImage, String> {
}
