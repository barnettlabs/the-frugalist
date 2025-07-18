<template>
    <div>
        <!-- Label -->
        <label
            v-if="label"
            :for="id || name"
            class="block text-sm font-medium text-gray-700 mb-1"
        >
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>

        <!-- Input component selection -->
        <component
            :is="inputComponent"
            v-model="modelValue"
            :id="id || name"
            :name="name"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :required="required"
            :autofocus="autofocus"
            :autocomplete="autocomplete"
            :error="errorMessage"
            :size="size"
            v-bind="inputSpecificProps"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
            ref="input"
        >
            <!-- Pass through slot content for select options -->
            <slot />
        </component>

        <!-- Error message -->
        <p v-if="errorMessage" class="mt-1 text-sm text-red-600">
            {{ errorMessage }}
        </p>

        <!-- Help text -->
        <p v-if="helpText" class="mt-1 text-sm text-gray-500">
            {{ helpText }}
        </p>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import BaseInput from "./BaseInput.vue";
import CurrencyInput from "./CurrencyInput.vue";
import PercentageInput from "./PercentageInput.vue";
import NumberInput from "./NumberInput.vue";
import TextareaInput from "./TextareaInput.vue";
import SelectInput from "./SelectInput.vue";

defineEmits(["focus", "blur"]);

const modelValue = defineModel({
    type: [String, Number],
    default: "",
});

const props = defineProps({
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
        validator: (value) =>
            [
                "text",
                "email",
                "password",
                "tel",
                "url",
                "date",
                "time",
                "datetime-local",
                "number",
                "currency",
                "percentage",
                "textarea",
                "select",
            ].includes(value),
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
        validator: (value) => ["sm", "md", "lg"].includes(value),
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

const input = ref(null);

// Component selection based on type
const inputComponent = computed(() => {
    switch (props.type) {
        case "currency":
            return CurrencyInput;
        case "percentage":
            return PercentageInput;
        case "number":
            return NumberInput;
        case "textarea":
            return TextareaInput;
        case "select":
            return SelectInput;
        default:
            return BaseInput;
    }
});

// Extract error message from error prop
const errorMessage = computed(() => {
    if (Array.isArray(props.error)) {
        return props.error[0];
    }
    return props.error;
});

// Props specific to the input component
const inputSpecificProps = computed(() => {
    const commonProps = {
        step: props.step,
        min: props.min,
        max: props.max,
        prefix: props.prefix,
        suffix: props.suffix,
    };

    if (props.type === "textarea") {
        return {
            ...commonProps,
            rows: props.rows,
            cols: props.cols,
            maxlength: props.maxlength,
            showCharacterCount: props.showCharacterCount,
            resize: props.resize,
        };
    }

    if (props.type === "select") {
        return {
            options: props.options,
        };
    }

    if (
        props.type === "number" ||
        props.type === "currency" ||
        props.type === "percentage"
    ) {
        return commonProps;
    }

    // For BaseInput (text, email, password, etc.)
    return {
        type: props.type,
        ...commonProps,
    };
});

// Expose focus method
defineExpose({
    focus: () => input.value?.focus(),
    blur: () => input.value?.blur(),
});
</script>
