# NumberGuessGameApi
# Picas y Famas 

Juego de Picas y Famas - API RESTful en C# con ASP.NET Core

## Frontend
🌐 https://picas-y-famas-web-ap-gxoz.bolt.host

## Tecnologías
- ASP.NET Core .NET 8
- Entity Framework Core + SQLite
- JWT Authentication
- ESCMB.GameCore (lógica del juego)

## Cómo correr el backend

1. Clonar el repositorio
2. Abrir `NumberGuessGameApi.sln` en Visual Studio
3. Ejecutar `Update-Database` en la Package Manager Console
4. Presionar F5

## Endpoints
- POST /api/game/v1/register
- POST /api/game/v1/login
- POST /api/game/v1/start (requiere JWT)
- POST /api/game/v1/guess (requiere JWT)
