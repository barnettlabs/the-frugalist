@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ url('images/fox-logo.png') }}" class="logo" alt="{{ trim($slot) }} Logo" style="height: 50px; max-height: 50px; width: 50px;">
</a>
</td>
</tr>
