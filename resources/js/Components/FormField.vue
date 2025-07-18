<template>
    <FormInput
        v-model="modelValue"
        :label="label"
        :name="name"
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :error="error"
        :help-text="helpText"
        :size="size"
        :step="step"
        :min="min"
        :max="max"
        :prefix="prefix"
        :suffix="suffix"
        :rows="rows"
        :cols="cols"
        :maxlength="maxlength"
        :show-character-count="showCharacterCount"
        :resize="resize"
        :options="options"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        v-bind="$attrs"
    >
        <!-- Pass through slot content -->
        <slot />
    </FormInput>
</template>

<script setup>
import FormInput from "./FormInput.vue";

defineEmits(["focus", "blur"]);

const modelValue = defineModel({
    type: [String, Number],
    default: "",
});

defineProps({
    label: {
        type: String,
        default: "",
    },
    name: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        default: "text",
    },
    placeholder: {
        type: String,
        default: "",
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    required: {
        type: Boolean,
        default: false,
    },
    autofocus: {
        type: Boolean,
        default: false,
    },
    autocomplete: {
        type: String,
        default: "",
    },
    error: {
        type: [String, Array],
        default: "",
    },
    helpText: {
        type: String,
        default: "",
    },
    size: {
        type: String,
        default: "md",
    },
    // Number/Currency specific props
    step: {
        type: [String, Number],
        default: undefined,
    },
    min: {
        type: [String, Number],
        default: undefined,
    },
    max: {
        type: [String, Number],
        default: undefined,
    },
    prefix: {
        type: String,
        default: "",
    },
    suffix: {
        type: String,
        default: "",
    },
    // Textarea specific props
    rows: {
        type: Number,
        default: 4,
    },
    cols: {
        type: Number,
        default: undefined,
    },
    maxlength: {
        type: Number,
        default: undefined,
    },
    showCharacterCount: {
        type: Boolean,
        default: false,
    },
    resize: {
        type: String,
        default: "vertical",
    },
    // Select specific props
    options: {
        type: Array,
        default: () => [],
    },
});
</script>
