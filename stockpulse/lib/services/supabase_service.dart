import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/product.dart';
import '../models/inventory_movement.dart';
import '../models/purchase_order.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  // --- Products ---

  Future<List<Product>> fetchProducts() async {
    final response = await client
        .from('products')
        .select('*')
        .order('name');
    return (response as List).map((json) => Product.fromJson(json)).toList();
  }

  Future<Product?> fetchProductByBarcode(String barcode) async {
    final response = await client
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .maybeSingle();
    if (response == null) return null;
    return Product.fromJson(response);
  }

  Future<Product> createProduct(Map<String, dynamic> data) async {
    final response = await client
        .from('products')
        .insert(data)
        .select()
        .single();
    return Product.fromJson(response);
  }

  Future<Product> updateProduct(String id, Map<String, dynamic> data) async {
    final response = await client
        .from('products')
        .update({...data, 'updated_at': DateTime.now().toIso8601String()})
        .eq('id', id)
        .select()
        .single();
    return Product.fromJson(response);
  }

  Future<void> deleteProduct(String id) async {
    await client.from('products').delete().eq('id', id);
  }

  Future<void> adjustQuantity(String productId, int delta, String? note, MovementType type) async {
    await client.rpc('adjust_product_quantity', params: {
      'p_product_id': productId,
      'p_delta': delta,
      'p_note': note,
      'p_type': type.name,
    });
  }

  // --- Inventory Movements ---

  Future<List<InventoryMovement>> fetchMovements({String? productId, int limit = 50}) async {
    var query = client
        .from('inventory_movements')
        .select('*, products(name)')
        .order('created_at', ascending: false)
        .limit(limit);
    if (productId != null) {
      query = query.eq('product_id', productId);
    }
    final response = await query;
    return (response as List).map((json) {
      final productName = json['products']?['name'] as String?;
      return InventoryMovement.fromJson({...json, 'product_name': productName});
    }).toList();
  }

  Future<InventoryMovement> createMovement(Map<String, dynamic> data) async {
    final response = await client
        .from('inventory_movements')
        .insert(data)
        .select()
        .single();
    return InventoryMovement.fromJson(response);
  }

  // --- Purchase Orders ---

  Future<List<PurchaseOrder>> fetchOrders() async {
    final response = await client
        .from('purchase_orders')
        .select('*')
        .order('ordered_at', ascending: false);
    return (response as List).map((json) => PurchaseOrder.fromJson(json)).toList();
  }

  Future<PurchaseOrder> createOrder(Map<String, dynamic> data) async {
    final response = await client
        .from('purchase_orders')
        .insert(data)
        .select()
        .single();
    return PurchaseOrder.fromJson(response);
  }

  Future<PurchaseOrder> updateOrderStatus(String id, OrderStatus status) async {
    final Map<String, dynamic> update = {
      'status': status.name,
    };
    if (status == OrderStatus.delivered) {
      update['received_at'] = DateTime.now().toIso8601String();
    }
    final response = await client
        .from('purchase_orders')
        .update(update)
        .eq('id', id)
        .select()
        .single();
    return PurchaseOrder.fromJson(response);
  }

  // --- Auth ---

  Future<AuthResponse> signIn(String email, String password) async {
    return await client.auth.signInWithPassword(email: email, password: password);
  }

  Future<AuthResponse> signUp(String email, String password) async {
    return await client.auth.signUp(email: email, password: password);
  }

  Future<void> signOut() async {
    await client.auth.signOut();
  }

  User? get currentUser => client.auth.currentUser;
  bool get isLoggedIn => currentUser != null;
}

final supabaseService = SupabaseService();
