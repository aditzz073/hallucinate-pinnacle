from setuptools import setup, find_packages

setup(
    name="pinnaclevault",
    version="1.0.1",
    description="Pinnacle AI visibility and GEO testing in your terminal.",
    author="Pinnacle AI",
    packages=find_packages(),
    install_requires=[
        "typer>=0.9.0",
        "rich>=13.0.0",
        "httpx>=0.24.0",
        "beautifulsoup4>=4.12.0",
    ],
    entry_points={
        "console_scripts": [
            "pinnacle=pinnacle_cli.main:app",
        ],
    },
)
