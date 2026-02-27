import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class PhotoCaptureWidget extends StatelessWidget {
  final List<String> photos;
  final ValueChanged<List<String>> onPhotosChanged;
  final int maxPhotos;

  const PhotoCaptureWidget({
    super.key,
    required this.photos,
    required this.onPhotosChanged,
    this.maxPhotos = 10,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            if (photos.length < maxPhotos) ...[
              OutlinedButton.icon(
                onPressed: () => _pickFromCamera(context),
                icon: const Icon(Icons.camera_alt_outlined, size: 18),
                label: const Text('Camera'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton.icon(
                onPressed: () => _pickFromGallery(context),
                icon: const Icon(Icons.photo_library_outlined, size: 18),
                label: const Text('Gallery'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
            ],
            const SizedBox(width: 8),
            Text('${photos.length}/$maxPhotos', style: const TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
        if (photos.isNotEmpty) ...[
          const SizedBox(height: 8),
          SizedBox(
            height: 80,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: photos.length,
              itemBuilder: (context, index) {
                return Stack(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      margin: const EdgeInsets.only(right: 6),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: photos[index].startsWith('http')
                            ? Image.network(photos[index], fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  color: Colors.grey.shade200,
                                  child: const Icon(Icons.photo),
                                ))
                            : Container(
                                color: Colors.grey.shade200,
                                child: const Icon(Icons.photo, color: Colors.grey),
                              ),
                      ),
                    ),
                    Positioned(
                      top: 2,
                      right: 8,
                      child: GestureDetector(
                        onTap: () {
                          final updated = List<String>.from(photos)..removeAt(index);
                          onPhotosChanged(updated);
                        },
                        child: Container(
                          width: 20,
                          height: 20,
                          decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                          child: const Icon(Icons.close, color: Colors.white, size: 12),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ],
    );
  }

  Future<void> _pickFromCamera(BuildContext context) async {
    final image = await ImagePicker().pickImage(source: ImageSource.camera, imageQuality: 75);
    if (image != null) {
      onPhotosChanged([...photos, image.path]);
    }
  }

  Future<void> _pickFromGallery(BuildContext context) async {
    final images = await ImagePicker().pickMultiImage(imageQuality: 75);
    if (images.isNotEmpty) {
      final remaining = maxPhotos - photos.length;
      final added = images.take(remaining).map((i) => i.path).toList();
      onPhotosChanged([...photos, ...added]);
    }
  }
}
