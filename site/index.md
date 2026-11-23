---
title: Documentation
---

# Build with Clinimatix Caravel

Expressive applications. Native .NET foundations. Build on .NET 10 LTS with ASP.NET Core endpoints, Clarion data access on EF Core, Bosun tooling, and optional application services. Keep standard hosting, dependency injection, configuration and cancellation throughout your app.

::: info 26.1 Public Preview 3
**26.1.3-rc3** is available on NuGet. It includes model-free Fathom project inspection and in-process tools with application-owned authorization. [Release notes](https://github.com/Clinimatix/Caravel/releases/tag/v26.1.3-rc3) · [Compatibility and adoption](v/26.1.3-rc3/release-policy.md).
:::

## Start building

[Build Shipâ€™s Checklist](learn/ships-checklist/index.md) from an empty project. Start with a web page, then try a terminal command or a SQLite-backed API.

- [Overview and quick start](v/26.1.3-rc3/overview.md)
- [Create an application](v/26.1.3-rc3/getting-started.md)
- [Browse every guide](v/26.1.3-rc3/index.md)

## Install the public preview

Requires the .NET 10 SDK. Install [Bosun from NuGet](https://www.nuget.org/packages/Clinimatix.Caravel.Bosun/26.1.3-rc3), then create and run an application:

```powershell
dotnet tool install --global Clinimatix.Caravel.Bosun --version 26.1.3-rc3
caravel new MyApp
caravel serve --project MyApp
```

All thirteen `26.1.3-rc3` packages are available on [nuget.org](https://www.nuget.org/profiles/Clinimatix). Select **Include prerelease** in Visual Studio and pin the exact version. [GitHub ZIPs and local feeds](v/26.1.3-rc3/release-policy.md#using-a-release-zip) remain an alternative.

### Start with an Identity application

```powershell
caravel new MyWorkspace --stack identity
```

The generated application contains editable models, native ASP.NET Core authentication and authorization, browser forms, command receipts and a background notice flow. Follow its README to restore tools, apply both database contexts' migrations and explicitly supply synthetic account credentials. Creation and startup never apply migrations, create accounts or provision cloud resources. SQLite migrations are included; SQL Server and PostgreSQL need their own reviewed native migrations.

Open `/work-items` after setup to sign in, select an item and complete it. The small UI supports password sign-in/sign-out and work items. Complete registration, recovery and MFA screens remain application work. The [authorized-command guide](v/26.1.3-rc3/authorized-commands.md) explains current access checks, revision conflicts and retry behavior.

## A quick look at routing

Define routes in an ordinary ASP.NET Core application. Caravel keeps native .NET tools within reach.

```csharp
using Caravel.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.AddCaravel();
var app = builder.Build();
app.UseCaravel();

app.Routes(routes =>
    routes.Get("/hello/{name}", (string name) => $"Hello, {name}!")
        .Name("greeting"));

if (await app.ExportCaravelRoutesAsync(args)) return;
await app.RunAsync();
```

## Compose the services you need

- [Clarion data access](v/26.1.3-rc3/clarion.md) â€” models, queries, transactions and soft deletes on EF Core.
- [Authentication](v/26.1.3-rc3/authentication.md) â€” local account endpoints, email confirmation, password recovery, authenticator MFA and recovery codes; separate guides cover OIDC, bearer tokens and Windows sign-in.
- [Authorized commands](v/26.1.3-rc3/authorized-commands.md) â€” application-owned current permissions, revision checks, durable receipts and reference-only background work.
- [Queues and workers](v/26.1.3-rc3/queues.md) â€” durable jobs, renewable leases, retries, recovery and transactional outbox dispatch.
- [Mail](v/26.1.3-rc3/mail.md) and [notifications](v/26.1.3-rc3/notifications.md) â€” SMTP, capture, templates, attachments and replaceable mail/SMS channels.
- [Storage](v/26.1.3-rc3/storage.md) and [Azure Blob storage](v/26.1.3-rc3/azure-storage.md) â€” streamed local files or an optional adapter with native revision conditions and an application-supplied Azure client.
- [Bosun tooling](v/26.1.3-rc3/bosun-data.md) â€” models, migrations and seeders from the command line.

Keep business rules and permissions in application code. Choose optional packages and replace adapters through standard dependency injection. Azure registration uses an existing container; credentials, provisioning, download eligibility and deployment qualification belong to your application. Mail/SMS delivery needs verification with your chosen provider; SMS delivery is not SMS MFA.

## Upgrade deliberately

Read [the upgrade guide](v/26.1.3-rc3/upgrading.md) and the [RC3 changelog](v/26.1.3-rc3/changelog.md) before upgrading. Update Bosun and every Caravel package reference you use to `26.1.3-rc3`, restore and review your lock files, then apply any reviewed application migrations explicitly. Existing generated applications are yours to maintain; updating Bosun does not rewrite them. See the [installation guidance](v/26.1.3-rc3/release-policy.md).

## Choose your documentation

The [RC3 docs](v/26.1.3-rc3/overview.md) describe this release. [RC2 docs](v/26.1.3-rc2/overview.md) remain available. [RC1](v/26.1.0-rc1/overview.md) stays available with its original scope; it does not include the new Identity starter or Azure adapter. The separate [development docs](v/dev/overview.md) track a reviewed source snapshot and remain labeled unreleased. Use [documentation versions](versions.md) or the version selector to switch.

See the [roadmap](v/26.1.3-rc3/roadmap.md) for remaining limits and future work, including full account screens, passkeys, calendar scheduling and additional storage/notification adapters.

## Explore Fathom

[Inspect a project or use application tools](v/26.1.3-rc3/fathom-tools.md) with RC3. The [Bosun installer guide](v/26.1.3-rc3/installer.md) includes the verified PowerShell installation command.
