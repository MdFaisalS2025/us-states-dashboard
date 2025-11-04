using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// optional for deep links
app.MapFallbackToFile("/index.html");

// simple test endpoint
app.MapGet("/healthz", () => "OK");

app.Run();
