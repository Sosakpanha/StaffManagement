# syntax=docker/dockerfile:1.7
# Multi-stage build for the StaffManagement.Api. Build context is the
# repo root (so the build can pull both this project and any future
# referenced projects); the API csproj is restored alone for layer
# caching and the rest of the source is copied in afterwards.

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore — copy only the csproj first so this layer is cacheable while
# source changes don't invalidate it.
COPY backend/src/StaffManagement.Api/StaffManagement.Api.csproj backend/src/StaffManagement.Api/
RUN dotnet restore backend/src/StaffManagement.Api/StaffManagement.Api.csproj

# Build + publish.
COPY backend/src/StaffManagement.Api/ backend/src/StaffManagement.Api/
RUN dotnet publish backend/src/StaffManagement.Api/StaffManagement.Api.csproj \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

# Chiseled runtime: minimal Ubuntu base, only what aspnet needs, no shell.
FROM mcr.microsoft.com/dotnet/aspnet:8.0-jammy-chiseled AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_RUNNING_IN_CONTAINER=true

ENTRYPOINT ["dotnet", "StaffManagement.Api.dll"]
