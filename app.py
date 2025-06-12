import streamlit as st
from tapas_bot import load_menu_data, get_answer_from_tapas

st.set_page_config(page_title="Soniya — Restaurant Chatbot", page_icon="🤖")
st.title("🍽️ Welcome to Soniya — Your Restaurant Assistant")

user_query = st.text_input("Ask me about our menu, pricing, availability...")

if user_query:
    with st.spinner("Soniya is thinking..."):
        table = load_menu_data()
        response = get_answer_from_tapas(user_query, table)
    st.success(f"Soniya: {response}")
