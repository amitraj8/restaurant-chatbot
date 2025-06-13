def get_answer_from_tapas(query, table):
    lower_q = query.lower()

    # Fallback greeting / help
    if any(x in lower_q for x in ["hello", "hi", "help", "how can you help"]):
        return (
            "Hi! I'm Soniya 🤖, your restaurant assistant.\n\n"
            "You can ask me things like:\n"
            "- What’s the price of Paneer Butter Masala?\n"
            "- Do you have vegetarian dishes?\n"
            "- How many items are under ₹200?"
        )

    # ✅ Handle vegetarian menu manually
    if "vegetarian" in lower_q or "veg" in lower_q:
        veg_items = table[table["types(veg, nonveg)"].str.lower().str.strip() == "veg"]["menu/Name"].tolist()
        return "Yes! Here's our vegetarian menu:\n" + ", ".join(veg_items)

    # ✅ Handle non-veg queries manually too
    if "nonveg" in lower_q or "non-vegetarian" in lower_q or "non veg" in lower_q:
        nonveg_items = table[table["types(veg, nonveg)"].str.lower().str.strip() == "nonveg"]["menu/Name"].tolist()
        return "Sure! Here's our non-vegetarian menu:\n" + ", ".join(nonveg_items)

    # Default: use TAPAS
    tapas_qa = pipeline("table-question-answering", model="google/tapas-large-finetuned-wtq")
    result = tapas_qa(table=table.to_dict(orient="records"), query=query)
    return result["answer"]
