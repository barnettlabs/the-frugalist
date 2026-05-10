<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BugReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BugReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BugReport::with('user:id,email,first_name,last_name')
            ->orderBy('created_at', 'desc');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json([
            'bug_reports' => $query->paginate(50),
        ]);
    }

    public function show(BugReport $bugReport): JsonResponse
    {
        $bugReport->load('user:id,email,first_name,last_name');

        return response()->json(['bug_report' => $bugReport]);
    }

    public function update(Request $request, BugReport $bugReport): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:new,in_progress,resolved,closed',
        ]);

        $bugReport->update($data);

        return response()->json(['bug_report' => $bugReport]);
    }

    public function destroy(BugReport $bugReport): JsonResponse
    {
        $bugReport->delete();

        return response()->json(['message' => 'Bug report deleted.']);
    }
}
