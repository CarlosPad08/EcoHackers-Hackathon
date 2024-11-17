import pandas as pd

archivo = r'C:\Users\HP\Documents\Hackathon-EcoHackers\backend\pyhton\database\NOV_ECOHACKERS.xlsx'
df = pd.read_excel(archivo)

print(df.head())

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

# Crear una nueva columna para la clasificación
df['Categoría'] = df.apply(lambda row: clasificar_ica(row['massPM2_5Avg'], row['massPM10_0Avg']), axis=1)

# Ver las primeras filas con la clasificación
print(df.columns)

# Filtrar datos de riesgo (opcional)
riesgo = df[df['Categoría'].isin(["Dañina a la salud", "Peligrosa"])]

# Guardar los resultados en un nuevo archivo Excel
riesgo.to_excel("resumen_calidad_aire.xlsx", index=False)

# Ver el archivo filtrado
#print(riesgo.head())
