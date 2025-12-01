interface DashboardData {
  textContent: string;
  updatedAt: string;
}

interface ApiResponse {
  textContent?: string;
  updatedAt?: string;
  error?: string;
}

document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
  const textContent = document.getElementById('textContent') as HTMLTextAreaElement;
  const messageAlert = document.getElementById('messageAlert') as HTMLDivElement;
  const savedContent = document.getElementById('savedContent') as HTMLDivElement;

  saveBtn.addEventListener('click', async () => {
    const content = textContent.value;

    // Disable button and show loading state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

    try {
      const response = await fetch('/api/dashboard', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ textContent: content })
      });

      const data: ApiResponse = await response.json();

      if (response.ok) {
        // Show success message
        showMessage('Data saved successfully!', 'success');

        // Update saved content display
        if (data.textContent) {
          savedContent.innerHTML = `
            <div class="saved-content-display mb-3">
              <pre>${escapeHtml(data.textContent)}</pre>
            </div>
            <p class="text-muted small">
              Last updated: ${new Date(data.updatedAt!).toLocaleString()}
            </p>
          `;
        }
      } else {
        showMessage(data.error || 'Failed to save data. Please try again.', 'danger');
      }
    } catch (error) {
      console.error('Save error:', error);
      showMessage('Failed to save data. Please try again.', 'danger');
    } finally {
      // Re-enable button
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Data';
    }
  });

  function showMessage(message: string, type: 'success' | 'danger'): void {
    messageAlert.className = `alert alert-${type}`;
    messageAlert.textContent = message;
    messageAlert.classList.remove('d-none');

    setTimeout(() => {
      messageAlert.classList.add('d-none');
    }, 3000);
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
