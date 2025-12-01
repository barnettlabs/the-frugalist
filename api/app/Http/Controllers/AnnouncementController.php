<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\JsonResponse;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        $announcements = Announcement::latest()->get();

        return response()->json($announcements);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        return response()->json($announcement);
    }
}
