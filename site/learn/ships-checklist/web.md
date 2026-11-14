# Build a web checklist

Save your first task in a Razor page. A Caravel provider will give every request access to the same checklist.

## Create the project

Use a serviced .NET 10 SDK (10.0.403 or later in the 10.0 line). Open a terminal in an empty parent folder and run:

```sh
dotnet new web -n ShipWeb --framework net10.0 --no-restore
cd ShipWeb
```

Replace `ShipWeb.csproj` with the following package references and project settings. All three guides target Caravel 26.1.2-rc2.

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
  </ItemGroup>
</Project>
```

## See a page first

Replace `Program.cs` with the following, create a `Pages` folder, then create `Pages/Index.cshtml` containing the two lines shown below.

```csharp
using Caravel.AspNetCore;
var builder = WebApplication.CreateBuilder(args);
builder.AddCaravel();
builder.Services.AddRazorPages();
var app = builder.Build();
app.UseCaravel();
app.MapRazorPages();
app.Run();
```

```html
@page
<h1>Ship’s Checklist</h1><p>Check the weather</p>
```

Run `dotnet run`, open the localhost address printed in your terminal, and look for the task. Press Ctrl+C. Now give the page a checklist it can change.

## Checklist.cs

Define one item and the checklist that holds it. The provider registers a singleton, so the next request sees the item you just added. Restarting the app gives you a fresh list. Create `Checklist.cs` with the following.

```csharp
namespace Ship.Web;

public record Item(int Id, string Title, bool Complete = false);

public class ChecklistProvider : Caravel.Core.ServiceProvider
{
    public override void Register(IServiceCollection services) =>
        services.AddSingleton<Checklist>();
}

public class Checklist
{
    private readonly List<Item> items = [new(1, "Check the weather")];
    private readonly object gate = new();
    public Item[] All()
    {
        lock (gate) return items.ToArray();
    }
    public void Add(string title)
    {
        lock (gate) items.Add(new(items.Count + 1, title));
    }
    public bool SetComplete(int id, bool complete)
    {
        lock (gate)
        {
            int index = items.FindIndex(item => item.Id == id);
            if (index < 0) return false;
            items[index] = items[index] with { Complete = complete };
            return true;
        }
    }
}
```

## Wire up the application

Register that provider with AddCaravel, then map Razor Pages. The final route-export line lets Bosun inspect the routes you mapped. Replace `Program.cs` with the following.

```csharp
using Caravel.AspNetCore;
using Ship.Web;

var builder = WebApplication.CreateBuilder(args);
builder.AddCaravel(options => options.AddProvider<ChecklistProvider>());
builder.Services.AddRazorPages();
var app = builder.Build();
app.UseStaticFiles();
app.UseCaravel();
app.MapRazorPages();
if (await app.ExportCaravelRoutesAsync(args)) return;
await app.RunAsync();
```

## Index.cshtml.cs

Give the page two handlers. Add trims and checks the title. Status changes one task by ID. A redirect after saving lets you refresh the page without adding the same task again. Create `Pages/Index.cshtml.cs` with the following.

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Ship.Web;

public class IndexModel(Checklist checklist) : PageModel
{
    public Item[] Items => checklist.All();
    [BindProperty] public string? Title { get; set; }
    public IActionResult OnPostAdd()
    {
        var title = Title?.Trim();
        if (string.IsNullOrEmpty(title) || title.Length > 80)
        {
            ModelState.AddModelError(nameof(Title), "Enter a task between 1 and 80 characters.");
            return Page();
        }
        checklist.Add(title);
        return RedirectToPage();
    }

    public IActionResult OnPostStatus(int id, bool complete) =>
        checklist.SetComplete(id, complete) ? RedirectToPage() : NotFound();
}
```

## Index.cshtml

Create the page. Razor renders each task as text and the form tag helper supplies the antiforgery token for each POST. Replace `Pages/Index.cshtml` with the following.

```html
@page
@model Ship.Web.IndexModel
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ship’s Checklist</title>
    <link rel="stylesheet" href="/checklist.css" />
</head>
<body>
<main>
    <h1>Ship’s Checklist</h1>
    <p>@Model.Items.Count(item => item.Complete) of @Model.Items.Length complete</p>
    <ul>
    @foreach (var item in Model.Items)
    {
        <li><form method="post" asp-page-handler="Status">
            <input type="hidden" name="id" value="@item.Id" />
            <label><input type="checkbox" name="complete" value="true" checked="@item.Complete" /> @item.Title</label>
            <button type="submit">Update</button>
        </form></li>
    }
    </ul>
    <form method="post" asp-page-handler="Add">
        <label for="Title">New task</label>
        <div class="entry"><input asp-for="Title" required maxlength="80" placeholder="Fill the water bottles" />
        <button type="submit">Add task</button></div>
        <span asp-validation-for="Title"></span>
    </form>
</main>
</body>
</html>
```

## checklist.css

Add the stylesheet under wwwroot. UseStaticFiles serves it at /checklist.css. Create `wwwroot/checklist.css` with the following.

```css
* { box-sizing: border-box; }
body { margin: 0; background: #edf4f2; color: #132f42; font: 1.05rem/1.5 system-ui,sans-serif; }
main { width: min(40rem, 94%); margin: 8vh auto; padding: clamp(1.2rem,5vw,3rem); border-top: .45rem solid #08746e; background: white; border-radius: .5rem; }
h1 { margin: 0; font: bold clamp(2.1rem,7vw,3.5rem)/1.1 Georgia,serif; }
p { color: #49636a; }
ul { padding: 0; margin: 2rem 0; list-style: none; }
li { border-top: 1px solid #c9d9d7; padding: .8rem 0; }
li form,.entry { display: flex; gap: .55rem; align-items: center; justify-content: space-between; flex-wrap: wrap; }
label { font-weight: 600; }
input[type=checkbox] { width: 1.2rem; height: 1.2rem; accent-color: #08746e; vertical-align: middle; }
input[type=text] { flex: 1; min-width: 8rem; border: 1px solid #8aa3a4; padding: .55rem; font: inherit; border-radius: .3rem; }
button { border: 0; border-radius: .3rem; padding: .6rem 1rem; background: #086b68; color: white; font: inherit; cursor: pointer; }
li button { color: #14525a; background: #e7f1ef; }
:focus-visible { outline: 3px solid #246cb1; outline-offset: 2px; }
.field-validation-error { color: #9e2929; }
```

## Try it

```sh
dotnet dev-certs https --trust
dotnet run --no-launch-profile -- --urls https://localhost:7043
```

Open `https://localhost:7043`. Add **Fill the water bottles**, tick its checkbox, and select **Update**. The count should read **1 of 2 complete**. Untick it and update again. To make the app yours, replace the starting task in Checklist.cs and restart.
