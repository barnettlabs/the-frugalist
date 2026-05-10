<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->orderBy('created_at', 'desc');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'users' => $query->paginate(50),
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->loadCount(['trackedProducts', 'vehicleFinanceSheets', 'vehicleLeaseSheets', 'devices']);

        return response()->json(['user' => $user]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'is_admin' => 'sometimes|boolean',
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$user->id,
        ]);

        if (array_key_exists('is_admin', $data)
            && $user->id === $request->user()->id
            && $data['is_admin'] === false) {
            return response()->json([
                'message' => 'You cannot remove your own admin access.',
            ], 422);
        }

        $user->update($data);

        return response()->json(['user' => $user]);
    }
}
