document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    updateTaskCount();
    
    // Adiciona evento de tecla para o input
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
});

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDate');
    
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;
    
    if (taskText !== '') {
        addTaskToDOM(taskText, false, priority, dueDate);
        taskInput.value = '';
        dueDateInput.value = '';
        saveTasks();
        updateTaskCount();
    }
}

function addTaskToDOM(text, completed, priority = 'medium', dueDate = '') {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');
    
    if (completed) {
        li.classList.add('completed');
    }
    
    li.classList.add(`${priority}-priority`);
    
    const dueDateFormatted = dueDate ? formatDueDate(dueDate) : '';
    
    li.innerHTML = `
        <div class="task-content">
            <span class="task-text">${text}</span>
            ${dueDateFormatted ? `<span class="task-due">${dueDateFormatted}</span>` : ''}
        </div>
        <div class="task-actions">
            <button class="complete-btn" title="Marcar como concluída">✓</button>
            <button class="edit-btn" title="Editar tarefa">✎</button>
            <button class="delete-btn" title="Excluir tarefa">✗</button>
        </div>
    `;
    
    li.querySelector('.complete-btn').addEventListener('click', function() {
        li.classList.toggle('completed');
        saveTasks();
        updateTaskCount();
    });
    
    li.querySelector('.edit-btn').addEventListener('click', function() {
        editTask(li);
    });
    
    li.querySelector('.delete-btn').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            li.remove();
            saveTasks();
            updateTaskCount();
        }
    });
    
    taskList.appendChild(li);
}

function editTask(taskElement) {
    const taskText = taskElement.querySelector('.task-text').textContent;
    const taskDue = taskElement.querySelector('.task-due') ? 
        taskElement.querySelector('.task-due').textContent : '';
    const priority = Array.from(taskElement.classList).find(cls => 
        cls.endsWith('-priority')).split('-')[0];
    
    const newText = prompt('Editar tarefa:', taskText);
    if (newText !== null && newText.trim() !== '') {
        taskElement.querySelector('.task-text').textContent = newText.trim();
        
        const newDue = prompt('Data de vencimento (DD/MM/AAAA):', taskDue);
        const dueDateElement = taskElement.querySelector('.task-due');
        
        if (newDue !== null) {
            if (newDue.trim() === '') {
                if (dueDateElement) {
                    dueDateElement.remove();
                }
            } else {
                const formattedDate = formatDueDate(newDue);
                if (dueDateElement) {
                    dueDateElement.textContent = formattedDate;
                } else {
                    const dueElement = document.createElement('span');
                    dueElement.className = 'task-due';
                    dueElement.textContent = formattedDate;
                    taskElement.querySelector('.task-content').appendChild(dueElement);
                }
            }
        }
        
        const newPriority = prompt('Prioridade (alta, media, baixa):', priority);
        if (newPriority && ['high', 'medium', 'low'].includes(newPriority)) {
            taskElement.classList.remove(`${priority}-priority`);
            taskElement.classList.add(`${newPriority}-priority`);
        }
        
        saveTasks();
    }
}

function formatDueDate(dateString) {
    // Tenta converter tanto de input date quanto do formato DD/MM/AAAA
    const dateParts = dateString.includes('/') ? 
        dateString.split('/') : 
        dateString.split('-').reverse();
    
    if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, '0');
        const month = dateParts[1].padStart(2, '0');
        const year = dateParts[2];
        return `Vence em: ${day}/${month}/${year}`;
    }
    return dateString;
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#taskList li').forEach(task => {
        const dueElement = task.querySelector('.task-due');
        const dueText = dueElement ? dueElement.textContent.replace('Vence em: ', '') : '';
        
        tasks.push({
            text: task.querySelector('.task-text').textContent,
            completed: task.classList.contains('completed'),
            priority: Array.from(task.classList).find(cls => cls.endsWith('-priority')).split('-')[0],
            dueDate: dueText
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => {
        addTaskToDOM(task.text, task.completed, task.priority, task.dueDate);
    });
}

function filterTasks(filter) {
    const tasks = document.querySelectorAll('#taskList li');
    
    tasks.forEach(task => {
        switch(filter) {
            case 'active':
                task.style.display = task.classList.contains('completed') ? 'none' : 'flex';
                break;
            case 'completed':
                task.style.display = task.classList.contains('completed') ? 'flex' : 'none';
                break;
            default:
                task.style.display = 'flex';
        }
    });
}

function clearCompleted() {
    if (confirm('Tem certeza que deseja limpar todas as tarefas concluídas?')) {
        const completedTasks = document.querySelectorAll('#taskList li.completed');
        completedTasks.forEach(task => task.remove());
        saveTasks();
        updateTaskCount();
    }
}

function updateTaskCount() {
    const totalTasks = document.querySelectorAll('#taskList li').length;
    const completedTasks = document.querySelectorAll('#taskList li.completed').length;
    const remainingTasks = totalTasks - completedTasks;
    
    const taskCount = document.getElementById('taskCount');
    taskCount.textContent = `${remainingTasks} de ${totalTasks} tarefas restantes`;
    
    if (totalTasks === 0) {
        taskCount.textContent = 'Nenhuma tarefa';
    } else if (completedTasks === totalTasks) {
        taskCount.textContent = 'Todas as tarefas concluídas!';
    }
}