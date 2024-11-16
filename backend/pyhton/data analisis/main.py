import pandas as pd

archivo = "../database/NOV_ECOHACKERS.xlsx"
df = pd.read_excel(archivo)

# Categorías del ICA
def clasificar_ica(pm2_5, pm10):
    if pm2_5 <= 12 and pm10 <= 54:
        return "Buena"
    elif pm2_5 <= 37 and pm10 <= 154:
        return "Moderada"
    elif pm2_5 <= 55 and pm10 <= 254:
        return "Dañina para grupos sensibles"
    elif pm2_5 <= 150 and pm10 <= 354:
        return "Dañina a la salud"
    elif pm2_5 <= 250 and pm10 <= 424:
        return "Muy dañina a la salud"
    else:
        return "Peligrosa"

# Nueva columna para la clasificación
df['Categoría'] = df.apply(lambda row: clasificar_ica(row['massPM2_5Avg'], row['massPM10_0Avg']), axis=1)

# Filtrar datos de riesgo (opcional)
riesgo = df[df['Categoría'] != "Buena"]

# Guardar resultados en un nuevo archivo Excel
riesgo.to_excel("resumen_calidad_aire.xlsx", index=False)
