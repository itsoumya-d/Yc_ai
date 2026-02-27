import 'package:flutter/material.dart';

class PhotoGrid extends StatelessWidget {
  final List<String> photoUrls;
  final int crossAxisCount;
  final void Function(int index)? onPhotoTap;
  final Widget? emptyWidget;

  const PhotoGrid({
    super.key,
    required this.photoUrls,
    this.crossAxisCount = 3,
    this.onPhotoTap,
    this.emptyWidget,
  });

  @override
  Widget build(BuildContext context) {
    if (photoUrls.isEmpty) {
      return emptyWidget ??
          const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.photo_library_outlined, size: 48, color: Colors.grey),
                SizedBox(height: 8),
                Text('No photos yet', style: TextStyle(color: Colors.grey)),
              ],
            ),
          );
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: 4,
        mainAxisSpacing: 4,
      ),
      itemCount: photoUrls.length,
      itemBuilder: (context, index) {
        return GestureDetector(
          onTap: () => onPhotoTap?.call(index),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              photoUrls[index],
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: Colors.grey.shade200,
                child: const Icon(Icons.broken_image_outlined, color: Colors.grey),
              ),
              loadingBuilder: (_, child, progress) {
                if (progress == null) return child;
                return Container(
                  color: Colors.grey.shade200,
                  child: const Center(
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }
}
