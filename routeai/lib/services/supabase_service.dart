import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/job.dart';
import '../models/driver.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  // Jobs
  static Future<List<Job>> getJobs({DateTime? date}) async {
    try {
      var query = client.from('jobs').select();
      if (date != null) {
        final start = DateTime(date.year, date.month, date.day);
        final end = start.add(const Duration(days: 1));
        query = query
            .gte('scheduled_time', start.toIso8601String())
            .lt('scheduled_time', end.toIso8601String());
      }
      final response = await query.order('scheduled_time');
      return (response as List).map((e) => Job.fromJson(e)).toList();
    } catch (e) {
      return _mockJobs();
    }
  }

  static Future<Job> createJob(Job job) async {
    try {
      final response = await client.from('jobs').insert(job.toJson()).select().single();
      return Job.fromJson(response);
    } catch (e) {
      return job;
    }
  }

  static Future<void> updateJob(Job job) async {
    try {
      await client.from('jobs').update(job.toJson()).eq('id', job.id);
    } catch (e) {
      // Handle offline
    }
  }

  static List<Job> _mockJobs() {
    final now = DateTime.now();
    return [
      Job(
        id: '1',
        customerName: 'Sarah Johnson',
        address: '1234 Oak Street, Springfield',
        serviceType: 'HVAC Maintenance',
        scheduledTime: DateTime(now.year, now.month, now.day, 9, 0),
        durationMinutes: 60,
        status: JobStatus.completed,
        notes: 'Annual maintenance check',
        driverId: 'd1',
        lat: 39.7817,
        lng: -89.6501,
      ),
      Job(
        id: '2',
        customerName: 'Mike Chen',
        address: '567 Maple Ave, Springfield',
        serviceType: 'Plumbing Repair',
        scheduledTime: DateTime(now.year, now.month, now.day, 11, 0),
        durationMinutes: 90,
        status: JobStatus.enRoute,
        notes: 'Leaking pipe under kitchen sink',
        driverId: 'd1',
        lat: 39.7987,
        lng: -89.6441,
      ),
      Job(
        id: '3',
        customerName: 'Emily Davis',
        address: '890 Pine Blvd, Springfield',
        serviceType: 'Electrical Inspection',
        scheduledTime: DateTime(now.year, now.month, now.day, 14, 0),
        durationMinutes: 120,
        status: JobStatus.scheduled,
        notes: 'Panel inspection required',
        driverId: 'd2',
        lat: 39.7717,
        lng: -89.6601,
      ),
      Job(
        id: '4',
        customerName: 'Robert Wilson',
        address: '321 Elm Court, Springfield',
        serviceType: 'Lawn Service',
        scheduledTime: DateTime(now.year, now.month, now.day, 10, 0),
        durationMinutes: 45,
        status: JobStatus.scheduled,
        notes: 'Weekly mowing service',
        driverId: 'd2',
        lat: 39.7917,
        lng: -89.6351,
      ),
      Job(
        id: '5',
        customerName: 'Linda Martinez',
        address: '654 Birch Rd, Springfield',
        serviceType: 'Window Cleaning',
        scheduledTime: DateTime(now.year, now.month, now.day, 15, 30),
        durationMinutes: 60,
        status: JobStatus.scheduled,
        notes: 'Full exterior window clean',
        driverId: null,
        lat: 39.7757,
        lng: -89.6481,
      ),
    ];
  }

  // Drivers
  static Future<List<Driver>> getDrivers() async {
    try {
      final response = await client.from('drivers').select();
      return (response as List).map((e) => Driver.fromJson(e)).toList();
    } catch (e) {
      return _mockDrivers();
    }
  }

  static Future<void> updateDriver(Driver driver) async {
    try {
      await client.from('drivers').update(driver.toJson()).eq('id', driver.id);
    } catch (e) {
      // Handle offline
    }
  }

  static List<Driver> _mockDrivers() {
    return [
      const Driver(
        id: 'd1',
        name: 'James Rivera',
        vehicle: 'Ford Transit - White (ABC-1234)',
        currentLat: 39.7900,
        currentLng: -89.6480,
        status: DriverStatus.busy,
        jobsToday: 4,
        phone: '+1-555-0101',
      ),
      const Driver(
        id: 'd2',
        name: 'Amy Thompson',
        vehicle: 'Ram ProMaster - Blue (XYZ-5678)',
        currentLat: 39.7750,
        currentLng: -89.6550,
        status: DriverStatus.available,
        jobsToday: 3,
        phone: '+1-555-0102',
      ),
      const Driver(
        id: 'd3',
        name: 'Carlos Mendez',
        vehicle: 'Chevy Express - Gray (LMN-9012)',
        currentLat: null,
        currentLng: null,
        status: DriverStatus.offline,
        jobsToday: 0,
        phone: '+1-555-0103',
      ),
    ];
  }
}
