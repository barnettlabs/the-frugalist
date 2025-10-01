<?php

namespace App\Http\Controllers;

use App\Models\BugReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BugReportController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'page_url' => 'required|string|max:500',
            'metadata' => 'nullable|array',
        ]);

        $bugReport = BugReport::create([
            'user_id' => Auth::id(),
            'subject' => $request->subject,
            'description' => $request->description,
            'page_url' => $request->page_url,
            'metadata' => $request->metadata,
        ]);

        return back()->with('success', 'Bug report submitted successfully. Thank you for your feedback!');
    }
}
