<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'announcements' => Announcement::latest()->get(),
        ]);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        return response()->json(['announcement' => $announcement]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:5000',
        ]);

        $announcement = Announcement::create($data);

        return response()->json(['announcement' => $announcement], 201);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:5000',
        ]);

        $announcement->update($data);

        return response()->json(['announcement' => $announcement]);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }
}
