<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        return response()->json($profile);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'nullable|string|max:255|unique:profiles,username,' . $request->user()->id . ',user_id',
            'avatar_url' => 'nullable|url|max:255',
            'website' => 'nullable|url|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
        ]);

        $profile = $request->user()->profile;

        if (!$profile) {
            $profile = new Profile();
            $profile->user_id = $request->user()->id;
        }

        $profile->fill($request->only([
            'username',
            'avatar_url',
            'website',
            'first_name',
            'last_name',
        ]));

        $profile->save();

        return response()->json($profile);
    }
}
