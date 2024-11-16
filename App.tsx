import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, TextInput, View, FlatList, TouchableOpacity, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the type for a task item
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskBeingEdited, setTaskBeingEdited] = useState<string | null>(null);

  // Animation reference
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTasks();
  }, []);

  // Load tasks from AsyncStorage
  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  // Save tasks to AsyncStorage
  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Failed to save tasks', error);
    }
  };

  // Add or update a task with animation
  const addOrUpdateTask = () => {
    if (task.trim()) {
      if (taskBeingEdited) {
        const updatedTasks = tasks.map((item) =>
          item.id === taskBeingEdited ? { ...item, text: task } : item
        );
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
        setTask('');
        setTaskBeingEdited(null);
      } else {
        // Add new task
        const newTask: Task = { id: Date.now().toString(), text: task, completed: false };
        const updatedTasks = [...tasks, newTask];

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        setTasks(updatedTasks);
        saveTasks(updatedTasks);
        setTask('');
      }
    }
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((item) => item.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map((item) =>
      item.id === taskId ? { ...item, completed: !item.completed } : item
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Start editing a task
  const startEditingTask = (taskId: string) => {
    const taskToEdit = tasks.find((item) => item.id === taskId);
    if (taskToEdit) {
      setTask(taskToEdit.text);
      setTaskBeingEdited(taskId);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add or edit a task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={addOrUpdateTask}
        >
          <Text style={styles.addButtonText}>{taskBeingEdited ? '✓' : '+'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.taskContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => toggleTaskCompletion(item.id)}
              >
                {item.completed ? (
                  <Text style={styles.checkedBox}>✔</Text>
                ) : (
                  <Text style={styles.uncheckedBox} />
                )}
              </TouchableOpacity>
              <Text
                style={[
                  styles.taskText,
                  item.completed && styles.completedTaskText,
                ]}
              >
                {item.text}
              </Text>
              <TouchableOpacity onPress={() => startEditingTask(item.id)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <Text style={styles.deleteButton}>X</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C5CFF',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#5C5CFF',
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: 'red', 
  },
  checkbox: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 3,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    fontSize: 16,
    color: '#5C5CFF',
  },
  uncheckedBox: {
    width: 16,
    height: 16,
  },
  editButton: {
    color: '#5C5CFF',
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
  },
  deleteButton: {
    color: '#FF5C5C',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
