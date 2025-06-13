import random

def wrap_response(query, answer):
    """Wrap TAPAS or rule-based output in a conversational reply."""
    query = query.lower()

    if "price" in query:
        return f"The price you're looking for is {answer}. Let me know if you'd like to add it to your order!"
    
    if "vegetarian" in query:
        return f"Absolutely! We offer a variety of vegetarian dishes including {answer}. Would you like recommendations for starters or main courses?"
    
    if "nonveg" in query or "chicken" in query:
        return f"Yes, we do! Here are some of our non-veg specialties: {answer}. Let me know if you'd like help choosing one."

    if "available" in query or "do you have" in query:
        return f"Yes, {answer} is currently available! Feel free to ask for pricing or portion sizes."

    # Fallback for all other questions
    templates = [
        f"Here's what I found: {answer}. Let me know if you'd like more details.",
        f"Based on your question, this might help: {answer}",
        f"{answer} — does that answer your question? I can help with more details too!"
    ]
    return random.choice(templates)

def get_answer_from_tapas(query, table):
    lower_q = query.lower()

    if any(x in lower_q for x in ["hello", "hi", "help"]):
        return (
            "Hi! I'm Soniya 🤖, your restaurant assistant. You can ask me things like:\n"
            "- What’s the price of Paneer Butter Masala?\n"
            "- Do you have vegetarian dishes?\n"
            "- Show me desserts under ₹200"
        )

    if "vegetarian" in lower_q or "veg" in lower_q:
        veg_items = table[table["types(veg, nonveg)"].str.lower().str.strip() == "veg"]["menu/Name"].tolist()
        return wrap_response(query, ", ".join(veg_items))

    if "nonveg" in lower_q or "non-vegetarian" in lower_q or "non veg" in lower_q:
        nonveg_items = table[table["types(veg, nonveg)"].str.lower().str.strip() == "nonveg"]["menu/Name"].tolist()
        return wrap_response(query, ", ".join(nonveg_items))

    # Run TAPAS
    tapas_qa = pipeline("table-question-answering", model="google/tapas-large-finetuned-wtq")
    result = tapas_qa(table=table.to_dict(orient="records"), query=query)
    return wrap_response(query, result["answer"])
