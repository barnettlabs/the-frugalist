<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'username' => $user->username,
            'avatar_url' => $user->avatar_url,
            'website' => $user->website,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'username' => 'nullable|string|max:255|unique:users,username,'.$user->id,
            'avatar_url' => 'nullable|url|max:255',
            'website' => 'nullable|url|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
        ]);

        $user->fill($request->only([
            'username',
            'avatar_url',
            'website',
            'first_name',
            'last_name',
        ]));

        $user->save();

        return response()->json([
            'username' => $user->username,
            'avatar_url' => $user->avatar_url,
            'website' => $user->website,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
        ]);
    }
}
