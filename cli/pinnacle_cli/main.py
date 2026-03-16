import typer
import httpx
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table
from typing_extensions import Annotated
from typing import Optional

from pinnacle_cli.config import set_api_key, get_api_key

app = typer.Typer(help="Pinnacle AI visibility in your terminal.")
console = Console()

# We can make this configurable via env var if needed, but for now standard port
API_BASE_URL = "http://localhost:8001/api"

@app.command()
def auth(api_key: str = typer.Argument(..., help="Your Pinnacle API Key from the dashboard")):
    """Authenticate the CLI with your Pinnacle account."""
    set_api_key(api_key)
    console.print("[bold green]✓[/bold green] Authentication successful. API key saved.")

@app.command()
def analyze(
    url: str = typer.Argument(..., help="The URL to analyze (e.g., http://localhost:3000)"),
    query: Annotated[Optional[str], typer.Option("--query", "-q", help="Optional target search query for the test")] = None,
):
    """Run an AI visibility audit, simulation, and analysis."""
    api_key = get_api_key()
    if not api_key:
        console.print("[bold red]Error:[/bold red] You must authenticate first. Run [bold cyan]pinnacle auth <api_key>[/bold cyan]")
        raise typer.Exit(1)

    with Progress(
        SpinnerColumn(spinner_name="dots", style="bright_magenta"),
        TextColumn("[bright_magenta]{task.description}[/bright_magenta]"),
        console=console,
    ) as progress:
        
        # 1. Fetching URL Locally
        fetch_task = progress.add_task(f"Fetching {url}... locally", total=None)
        try:
            # We fetch directly using httpx from the developer's machine
            with httpx.Client(verify=False, timeout=15.0, follow_redirects=True) as client:
                response = client.get(url)
                response.raise_for_status()
                html_content = response.text
        except httpx.HTTPError as exc:
            progress.stop()
            console.print(f"[bold red]Error tracking {url}:[/bold red] {exc}")
            raise typer.Exit(1)
            
        progress.update(fetch_task, description="Analyzing AI visibility...", completed=True)

        # 2. Sending raw HTML to backend for analysis
        headers = {"Authorization": f"Bearer {api_key}"}
        payload = {"url": url, "html": html_content}
        if query:
            payload["query"] = query

        try:
            with httpx.Client(timeout=60.0) as client:
                api_response = client.post(
                    f"{API_BASE_URL}/cli/analyze",
                    json=payload,
                    headers=headers
                )
                
                if api_response.status_code == 401:
                    progress.stop()
                    console.print("[bold red]Error:[/bold red] Invalid API key. Please run [bold cyan]pinnacle auth <api_key>[/bold cyan] again.")
                    raise typer.Exit(1)
                
                api_response.raise_for_status()
                result = api_response.json()
        except httpx.HTTPError as exc:
            progress.stop()
            console.print(f"[bold red]Error communicating with Pinnacle AI API:[/bold red] {exc}")
            raise typer.Exit(1)

    # 3. Output beautiful results matching the landing page
    
    # Header metrics
    console.print("")
    score = result.get("visibility_score", 0)
    score_color = "bright_green" if score > 80 else "yellow" if score > 50 else "red"
    
    cit_prob = result.get("citation_probability", "N/A")
    top_engine = result.get("top_engine", "Unknown")
    
    console.print(f"[gray]AI Visibility Score:[/gray] [{score_color} bold]{score}[/{score_color} bold]")
    console.print(f"[gray]Citation Probability:[/gray] [cyan bold]{cit_prob}[/cyan bold]")
    if top_engine:
        console.print(f"[gray]Top Engine:[/gray] [bright_green bold]{top_engine}[/bright_green bold]")
    
    console.print("")
    
    # Engine Readiness Breakdown
    if "engine_readiness" in result:
        console.print("[bright_magenta bold]Engine Readiness[/bright_magenta bold]")
        engines = result["engine_readiness"]
        for engine_name, engine_score in engines.items():
            color = "bright_green" if engine_score > 80 else "yellow" if engine_score > 60 else "cyan" if engine_score > 70 else "red"
            # Special case matching UI: Gemini=yellow, Copilot=indigo (simulated with blue/magenta)
            if engine_name == "Gemini" and color not in ("red", "bright_green"): color = "yellow"
            if engine_name == "Copilot" and color not in ("red", "bright_green"): color = "magenta"
            
            console.print(f"  [gray]{engine_name}[/gray] [{color} bold]{engine_score}[/{color} bold]")
            
        console.print("")
        
    # Recommendations
    recs = result.get("recommendations", [])
    if recs:
        console.print("[bright_magenta bold]Recommendations[/bright_magenta bold]")
        for rec in recs:
            console.print(f"  [bright_green]✓[/bright_green] [white]{rec}[/white]")

    console.print("")

if __name__ == "__main__":
    app()
