"""
Index view for Cithara web interface.

Renders the Django template-based frontend page.
"""

from django.shortcuts import render


def index(request):
    """
    Render the Cithara web interface.
    
    This is a simple frontend that demonstrates the REST API functionality.
    """
    return render(request, 'index.html')
