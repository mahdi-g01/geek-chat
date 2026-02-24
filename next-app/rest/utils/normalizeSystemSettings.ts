export function normalizeSystemSettings(settings: { key: string; title: string; value: string | boolean | number }[]) {
    return settings.map((item) => {
        const typedItem = { ...item };
        if (item.value == undefined) {
            throw new Error("A system setting value should not be null")
        }
        if (item.value == "true") {
            typedItem.value = true;
            return typedItem;
        }
        if (item.value == "false") {
            typedItem.value = false;
            return typedItem;
        }
        if (isNaN(Number(item.value))) {
            typedItem.value = `${typedItem.value}`;
            return typedItem;
        } else {
            typedItem.value = Number(typedItem.value);
            return typedItem;
        }
    })
}