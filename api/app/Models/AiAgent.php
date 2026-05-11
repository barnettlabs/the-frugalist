<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiAgent extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'provider_id',
        'model',
        'system_prompt',
        'user_prompt_template',
        'response_format',
        'output_schema',
        'temperature',
        'top_p',
        'max_tokens',
        'version',
        'enabled',
        'rate_limit_per_user_day',
        'settings',
    ];

    protected $casts = [
        'output_schema' => AsArrayObject::class,
        'settings' => AsArrayObject::class,
        'temperature' => 'float',
        'top_p' => 'float',
        'max_tokens' => 'integer',
        'version' => 'integer',
        'enabled' => 'boolean',
        'rate_limit_per_user_day' => 'integer',
    ];

    public function provider(): BelongsTo
    {
        return $this->belongsTo(AiProvider::class, 'provider_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(AiAgentVersion::class, 'agent_id')->orderByDesc('version');
    }

    public function resolveModel(): ?string
    {
        return $this->model ?: ($this->provider?->default_model);
    }

    public function snapshot(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'provider_id' => $this->provider_id,
            'model' => $this->model,
            'system_prompt' => $this->system_prompt,
            'user_prompt_template' => $this->user_prompt_template,
            'response_format' => $this->response_format,
            'output_schema' => $this->output_schema?->toArray(),
            'temperature' => $this->temperature,
            'top_p' => $this->top_p,
            'max_tokens' => $this->max_tokens,
            'settings' => $this->settings?->toArray(),
        ];
    }
}
