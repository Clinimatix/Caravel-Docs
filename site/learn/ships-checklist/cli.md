# Build a command-line checklist

Record a task in one terminal command and complete it in another. A Caravel event connects completion to a printable receipt.

## Create the project

Use a serviced .NET 10 SDK (10.0.404 or later in the 10.0 line). Open a terminal in an empty parent folder and run:

```sh
dotnet new console -n ShipCli --framework net10.0 --no-restore
cd ShipCli
```

Replace `ShipCli.csproj` with the following package references and project settings. All three guides target Caravel 26.1.3-rc2.

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <ManagePackageVersionsCentrally>false</ManagePackageVersionsCentrally>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Clinimatix.Caravel.Events" Version="26.1.3-rc2" />
    <PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="10.0.15" />
  </ItemGroup>
</Project>
```

## Wire up the application

Read the command arguments first. The list command reads the file, while add and complete save the updated list. Once a completion is saved, the dispatcher runs PrintReceipt in the current scope. A second completion leaves the task unchanged. Replace `Program.cs` with the following.

```csharp
using System.Text.Json;
using Caravel.Events;
using Microsoft.Extensions.DependencyInjection;

if (args is not (["list"] or ["add", _] or ["complete", _]))
{
    Console.Error.WriteLine("Usage: list | add \"Task title\" | complete ID");
    return 2;
}

var services = new ServiceCollection();
services.AddCaravelEvents().AddEventListener<TaskCompleted, PrintReceipt>();
await using var provider = services.BuildServiceProvider();
await using var scope = provider.CreateAsyncScope();

const string path = "checklist.json";
try
{
    // Hold the lock from read through replacement so two commands cannot lose an update.
    using var gate = File.Open(path + ".lock", FileMode.OpenOrCreate, FileAccess.Write, FileShare.None);
    List<Item> items = File.Exists(path)
        ? JsonSerializer.Deserialize<List<Item>>(await File.ReadAllTextAsync(path))
            ?? throw new JsonException("Expected a list.")
        : [];
    if (args[0] == "list")
    {
        if (items.Count == 0) Console.WriteLine("No tasks yet.");
        foreach (var item in items)
            Console.WriteLine($"{item.Id} [{(item.Complete ? "x" : " ")}] {item.Title}");
        return 0;
    }
    TaskCompleted? completed = null;
    if (args[0] == "add")
    {
        var title = args[1].Trim();
        if (title.Length is < 1 or > 80)
        {
            Console.Error.WriteLine("Enter a task between 1 and 80 characters.");
            return 2;
        }
        items.Add(new(items.Count + 1, title));
    }
    else
    {
        int index = int.TryParse(args[1], out int id) ? items.FindIndex(x => x.Id == id) : -1;
        if (index < 0)
        {
            Console.Error.WriteLine("Task not found. Run list to see the IDs.");
            return 2;
        }
        if (items[index].Complete) return 0;
        items[index] = items[index] with { Complete = true };
        completed = new(items[index].Title);
    }
    await File.WriteAllTextAsync(path + ".tmp", JsonSerializer.Serialize(items));
    File.Move(path + ".tmp", path, overwrite: true);
    if (completed is not null)
        await scope.ServiceProvider.GetRequiredService<IEventDispatcher>().DispatchAsync(completed);
    else Console.WriteLine($"Added: {items[^1].Title}");
    return 0;
}
catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or JsonException)
{
    Console.Error.WriteLine($"Could not use the checklist: {ex.Message}");
    return 1;
}

record Item(int Id, string Title, bool Complete = false);
record TaskCompleted(string Title);
class PrintReceipt : IEventListener<TaskCompleted>
{
    public Task HandleAsync(TaskCompleted message, CancellationToken cancellationToken)
    {
        Console.WriteLine($"Completed: {message.Title}");
        return Task.CompletedTask;
    }
}
```

## Try it

```sh
dotnet run -- add "Check the weather"
dotnet run -- list
dotnet run -- complete 1
dotnet run -- list
```

In a fresh folder the first list shows `1 [ ] Check the weather`. Completing it prints `Completed: Check the weather`. Running list again shows `1 [x] Check the weather`. Try adding a second task, then completing it by its ID. The JSON file lives in the directory where you run the commands.
