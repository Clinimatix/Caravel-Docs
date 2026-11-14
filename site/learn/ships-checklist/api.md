# Build a checklist API

Give another application a way to add and complete tasks. Clarion hands each request its own database session, and SQLite keeps the list between launches.

## Create the project

Use a serviced .NET 10 SDK (10.0.403 or later in the 10.0 line). Open a terminal in an empty parent folder and run:

```sh
dotnet new web -n ShipApi --framework net10.0 --no-restore
cd ShipApi
```

Replace `ShipApi.csproj` with the following package references and project settings. All three guides target Caravel 26.1.2-rc2.

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <ManagePackageVersionsCentrally>false</ManagePackageVersionsCentrally>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Clinimatix.Caravel.AspNetCore" Version="26.1.2-rc2" />
    <PackageReference Include="Clinimatix.Caravel.Clarion" Version="26.1.2-rc2" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="10.0.13" />
  </ItemGroup>
</Project>
```

## Wire up the application

Start with ChecklistItem and ChecklistDb at the bottom. AddClarion connects the context to SQLite. The init command creates the tables explicitly. Follow a POST through Models, Add, SaveChangesAsync and the 201 response. Compare that write with the read-only query behind GET /tasks. Replace `Program.cs` with the following.

```csharp
using Caravel.AspNetCore;
using Caravel.Clarion;
using Microsoft.EntityFrameworkCore;

bool initialize = args is ["init"];
var builder = WebApplication.CreateBuilder(initialize ? Array.Empty<string>() : args);
builder.AddCaravel();
builder.Services.AddClarion<ChecklistDb>(options => options.UseSqlite(initialize
    ? "Data Source=checklist.db" : "Data Source=checklist.db;Mode=ReadWrite"));
var app = builder.Build();
if (initialize)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ChecklistDb>();
    await db.Database.EnsureCreatedAsync();
    Console.WriteLine("Checklist database ready.");
    return;
}
app.UseCaravel();
app.Routes(routes => routes.Get("/", () => "Ship’s Checklist API").Name("home"));
app.MapGet("/tasks", async (IClarion db, CancellationToken ct) =>
    await db.Models<ChecklistItem>().AsNoTracking().OrderBy(x => x.Id).GetAsync(ct));
app.MapGet("/tasks/{id:int}", async (int id, IClarion db, CancellationToken ct) =>
    await db.Models<ChecklistItem>().FindAsync([id], ct) is { } item
        ? Results.Ok(item) : Results.NotFound());
app.MapPost("/tasks", async (NewTask input, IClarion db, CancellationToken ct) =>
{
    var title = input.Title?.Trim();
    if (string.IsNullOrEmpty(title) || title.Length > 80)
        return Results.BadRequest("Enter a task between 1 and 80 characters.");
    var item = new ChecklistItem { Title = title };
    db.Models<ChecklistItem>().Add(item);
    await db.SaveChangesAsync(ct);
    return Results.Created($"/tasks/{item.Id}", item);
});
app.MapPut("/tasks/{id:int}/complete", async (int id, IClarion db, CancellationToken ct) =>
{
    var item = await db.Models<ChecklistItem>().FindAsync([id], ct);
    if (item is null) return Results.NotFound();
    item.Complete = true;
    await db.SaveChangesAsync(ct);
    return Results.Ok(item);
});
if (await app.ExportCaravelRoutesAsync(args)) return;
await app.RunAsync();

record NewTask(string? Title);
class ChecklistItem
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public bool Complete { get; set; }
}
class ChecklistDb(DbContextOptions<ChecklistDb> options) : DbContext(options)
{
    public DbSet<ChecklistItem> Tasks => Set<ChecklistItem>();
}
```

## Try it

```sh
dotnet run -- init
dotnet run --no-launch-profile -- --urls http://localhost:5086
```

In a second PowerShell terminal, add a task and use the ID returned by the API.

```powershell
$api = 'http://localhost:5086/tasks'
$item = Invoke-RestMethod $api -Method Post -ContentType 'application/json' -Body '{"title":"Check the weather"}'
Invoke-RestMethod "$api/$($item.id)/complete" -Method Put
Invoke-RestMethod $api
```

The POST returns the saved task and its Location. Completing it changes `complete` to `true`. Stop the server with Ctrl+C, run the same server command again, and list the tasks. Your completed task should still be there. Try sending an empty title and inspect the 400 response.
