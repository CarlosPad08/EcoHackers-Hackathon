import os
import pandas as pd
import json

# Función para convertir las fechas en formato adecuado para JSON
def convertir_fechas_a_cadena(df):
    for col in df.select_dtypes(include=["datetime"]).columns:
        df[col] = df[col].dt.strftime('%Y-%m-%d %H:%M:%S')  # O usa .isoformat()
    return df

def clasificar_pronostico_tiempo(row):
    try:
        temp = float(row['temperatureMax'])  
        if temp < 0:
            return "Frío"
        elif 0 <= temp <= 15:
            return "Templado"
        elif 15 < temp <= 25:
            return "Cálido"
        else:
            return "Calor extremo"
    except (ValueError, TypeError):
        return "Datos no válidos"

def clasificar_velocidad_viento(wind_speed):
    if wind_speed < 10:
        return "Viento leve"
    elif 10 <= wind_speed <= 25:
        return "Viento moderado"
    elif 26 <= wind_speed <= 40:
        return "Viento fuerte"
    else:
        return "Viento muy fuerte"

def clasificar_ray_uv(uv_index):
    if uv_index <= 2:
        return {"Riesgo": "Bajo", "Precaución": "Ninguna"}
    elif 3 <= uv_index <= 5:
        return {"Riesgo": "Moderado", "Precaución": "Usar protector solar"}
    elif 6 <= uv_index <= 7:
        return {"Riesgo": "Alto", "Precaución": "Evitar el sol por tiempo prolongado"}
    elif 8 <= uv_index <= 10:
        return {"Riesgo": "Muy alto", "Precaución": "Protegerse completamente del sol"}
    else:
        return {"Riesgo": "Extremo", "Precaución": "Evitar el sol completamente"}

def clasificar_ruido(noise_level):
    if noise_level <= 30:
        return {"Categoría": "Muy bajo", "Ejemplos": "Silencio", "Impacto": "Sin impacto"}
    elif 31 <= noise_level <= 60:
        return {"Categoría": "Moderado", "Ejemplos": "Conversaciones", "Impacto": "Poca molestia"}
    elif 61 <= noise_level <= 80:
        return {"Categoría": "Alto", "Ejemplos": "Tráfico", "Impacto": "Puede causar molestia"}
    elif 81 <= noise_level <= 100:
        return {"Categoría": "Muy alto", "Ejemplos": "Construcción", "Impacto": "Molestia significativa"}
    else:
        return {"Categoría": "Extremo", "Ejemplos": "Ruido de maquinaria pesada", "Impacto": "Impacto grave"}

def clasificar_ica(pm2_5, pm10):
    if pm2_5 <= 12 and pm10 <= 54:
        return {"Calidad del aire": "Buena", "Impacto": "Sin riesgo para la salud."}
    elif pm2_5 <= 37 and pm10 <= 154:
        return {"Calidad del aire": "Moderada", "Impacto": "Riesgo bajo, pero puede afectar a personas sensibles."}
    elif pm2_5 <= 55 and pm10 <= 254:
        return {"Calidad del aire": "Dañina para grupos sensibles", "Impacto": "Personas con problemas respiratorios o cardíacos pueden experimentar efectos adversos."}
    elif pm2_5 <= 150 and pm10 <= 354:
        return {"Calidad del aire": "Dañina a la salud", "Impacto": "Efectos adversos para la salud de todos."}
    elif pm2_5 <= 250 and pm10 <= 424:
        return {"Calidad del aire": "Muy dañina a la salud", "Impacto": "Efectos graves para la salud."}
    else:
        return {"Calidad del aire": "Peligrosa", "Impacto": "Riesgo de emergencia sanitaria; toda la población puede ser afectada."}

# Función principal para procesar el archivo y generar JSON
def procesar_archivo_y_generar_json(archivo):
    try:
        # Leer el archivo Excel
        df = pd.read_excel(archivo)
        print(f"Procesando archivo: {archivo}")
        print(f"Columnas encontradas: {df.columns}")

        # Convertir las fechas a cadena
        df = convertir_fechas_a_cadena(df)

        categoria = None

        # Clasificación según las columnas
        if 'temperatureMax' in df.columns:
            # Verificar y manejar valores nulos
            if df['temperatureMax'].isnull().any():
                print("Advertencia: Se encontraron valores nulos en 'temperatureMax'.")
                df['temperatureMax'].fillna(0, inplace=True)  # Opcional: rellenar con 0 o un valor predeterminado
            categoria = "pronostico_tiempo"
            df['Categoria_Pronostico'] = df.apply(clasificar_pronostico_tiempo, axis=1)
        
        # Agregar manejo para 'windSpeedMax'
        if 'windSpeedMax' in df.columns:
            # Verificar y manejar valores nulos
            if df['windSpeedMax'].isnull().any():
                print("Advertencia: Se encontraron valores nulos en 'windSpeedMax'.")
                df['windSpeedMax'].fillna(0, inplace=True)  # Opcional: rellenar con 0 o un valor predeterminado
            categoria = "viento"
            df['Categoria_Viento'] = df['windSpeedMax'].apply(clasificar_velocidad_viento)
        
        elif 'uvIndexMax' in df.columns:
            categoria = "rayos_uv"
            df['Riesgo_UV'] = df['uvIndexMax'].apply(lambda uv: clasificar_ray_uv(uv)['Riesgo'])
            df['Precaución_UV'] = df['uvIndexMax'].apply(lambda uv: clasificar_ray_uv(uv)['Precaución'])
        elif 'noiseMax' in df.columns:
            categoria = "ruido"
            df['Categoría_Ruido'] = df['noiseMax'].apply(lambda noise: clasificar_ruido(noise)['Categoría'])
            df['Ejemplos_Ruido'] = df['noiseMax'].apply(lambda noise: clasificar_ruido(noise)['Ejemplos'])
            df['Impacto_Ruido'] = df['noiseMax'].apply(lambda noise: clasificar_ruido(noise)['Impacto'])
        elif 'massPM2_5Max' in df.columns and 'massPM10_0Max' in df.columns:
            categoria = "sustancias_clima"
            df['Calidad_Aire'] = df.apply(lambda row: clasificar_ica(row['massPM2_5Max'], row['massPM10_0Max'])['Calidad del aire'], axis=1)
            df['Impacto_Aire'] = df.apply(lambda row: clasificar_ica(row['massPM2_5Max'], row['massPM10_0Max'])['Impacto'], axis=1)

        if categoria is None:
            print(f"El archivo no tiene las columnas necesarias para procesar.")
        else:
            # Guardar como JSON
            output_folder = "./json_categorias"
            os.makedirs(output_folder, exist_ok=True)
            json_path = os.path.join(output_folder, f"{categoria}_{os.path.basename(archivo)}.json")
            processed_data = df.to_dict(orient="records")
            with open(json_path, "w", encoding="utf-8") as json_file:
                json.dump(processed_data, json_file, indent=4, ensure_ascii=False)
            print(f"Archivo JSON generado para {categoria}: {json_path}")

    except Exception as e:
        print(f"Error al procesar el archivo {archivo}: {e}")

# Lista de archivos a procesar
archivos = ["./data/NOV_ECOHACKERS.xlsx", "./data/NOISE.xlsx", "./data/SURTH.xlsx", "./data/WIND.xlsx"]

# Procesar cada archivo
for archivo in archivos:
    procesar_archivo_y_generar_json(archivo)
