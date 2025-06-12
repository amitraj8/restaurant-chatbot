import pandas as pd
from transformers import pipeline

def load_menu_data():
    df = pd.read_csv("data/Restaurant data.csv")
    return df[["menu/Name", "types(veg, nonveg)", "price", "inventory"]].astype(str)

def get_answer_from_tapas(query, table):
    tapas_qa = pipeline("table-question-answering", model="google/tapas-large-finetuned-wtq")
    result = tapas_qa(table=table.to_dict(orient="records"), query=query)
    return result["answer"]
