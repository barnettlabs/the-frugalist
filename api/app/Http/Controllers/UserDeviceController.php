<?php

namespace App\Http\Controllers;

use App\Models\UserDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserDeviceController extends Controller
{
    /**
     * List user's registered devices.
     */
    public function index(Request $request): JsonResponse
    {
        $devices = $request->user()->devices()
            ->orderBy('last_used_at', 'desc')
            ->get();

        return response()->json([
            'devices' => $devices,
        ]);
    }

    /**
     * Register or update a device token.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'push_token' => 'required|string|max:500',
            'device_type' => 'required|string|in:ios,android,web',
            'device_name' => 'nullable|string|max:255',
        ]);

        // Check if this token already exists for any user
        $existingDevice = UserDevice::where('push_token', $validated['push_token'])->first();

        if ($existingDevice) {
            // If it belongs to this user, update it
            if ($existingDevice->user_id === $request->user()->id) {
                $existingDevice->update([
                    'device_name' => $validated['device_name'] ?? $existingDevice->device_name,
                    'device_type' => $validated['device_type'],
                    'is_active' => true,
                    'last_used_at' => now(),
                ]);

                return response()->json([
                    'device' => $existingDevice->fresh(),
                    'message' => 'Device updated successfully.',
                ]);
            }

            // If it belongs to another user, reassign it
            $existingDevice->update([
                'user_id' => $request->user()->id,
                'device_name' => $validated['device_name'] ?? $existingDevice->device_name,
                'device_type' => $validated['device_type'],
                'is_active' => true,
                'last_used_at' => now(),
            ]);

            return response()->json([
                'device' => $existingDevice->fresh(),
                'message' => 'Device registered successfully.',
            ]);
        }

        // Create new device
        $device = $request->user()->devices()->create([
            'push_token' => $validated['push_token'],
            'device_type' => $validated['device_type'],
            'device_name' => $validated['device_name'],
            'is_active' => true,
            'last_used_at' => now(),
        ]);

        return response()->json([
            'device' => $device,
            'message' => 'Device registered successfully.',
        ], 201);
    }

    /**
     * Update device settings.
     */
    public function update(Request $request, UserDevice $device): JsonResponse
    {
        // Ensure user owns this device
        if ($device->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'is_active' => 'sometimes|boolean',
            'device_name' => 'sometimes|nullable|string|max:255',
        ]);

        $device->update($validated);

        return response()->json([
            'device' => $device->fresh(),
            'message' => 'Device updated successfully.',
        ]);
    }

    /**
     * Remove a device.
     */
    public function destroy(Request $request, UserDevice $device): JsonResponse
    {
        // Ensure user owns this device
        if ($device->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $device->delete();

        return response()->json([
            'message' => 'Device removed successfully.',
        ]);
    }
}
