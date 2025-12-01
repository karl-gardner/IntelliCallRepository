interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface CustomerFormData {
  name: string;
  email: string;
  password?: string;
}

interface ApiResponse {
  id?: string;
  name?: string;
  email?: string;
  createdAt?: string;
  error?: string;
}

document.addEventListener('DOMContentLoaded', () => {
  const addCustomerForm = document.getElementById('addCustomerForm') as HTMLFormElement;
  const messageAlert = document.getElementById('messageAlert') as HTMLDivElement;
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
  const customersTable = document.getElementById('customersTable') as HTMLTableSectionElement;
  const customerCount = document.getElementById('customerCount') as HTMLSpanElement;

  addCustomerForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    const formData = new FormData(addCustomerForm);
    const data: CustomerFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: (formData.get('password') as string) || undefined
    };

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      const result: ApiResponse = await response.json();

      if (response.ok) {
        showMessage('Customer added successfully!', 'success');
        addCustomerForm.reset();

        // Add new customer to table
        if (result.id && result.name && result.email && result.createdAt) {
          addCustomerToTable({
            id: result.id,
            name: result.name,
            email: result.email,
            createdAt: result.createdAt
          });

          // Update customer count
          const currentCount = parseInt(customerCount.textContent || '0');
          customerCount.textContent = (currentCount + 1).toString();
        }
      } else {
        showMessage(result.error || 'Failed to add customer. Please try again.', 'danger');
      }
    } catch (error) {
      console.error('Add customer error:', error);
      showMessage('Failed to add customer. Please try again.', 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Customer';
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

  function addCustomerToTable(customer: Customer): void {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(customer.name)}</td>
      <td>${escapeHtml(customer.email)}</td>
      <td>${new Date(customer.createdAt).toLocaleDateString()}</td>
      <td><code>${customer.id.substring(0, 8)}...</code></td>
      <td>
        <form action="/login-as-customer" method="POST" class="d-inline">
          <input type="hidden" name="customerId" value="${customer.id}">
          <button type="submit" class="btn btn-sm btn-primary">Login As</button>
        </form>
      </td>
    `;
    customersTable.insertBefore(row, customersTable.firstChild);
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
