import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Modal, Pressable, SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import {
  Candy, Users, User, LogOut, Plus, X,
  MapPin, Clock, Calendar, Tag, Trash2, Pencil, Menu
} from 'lucide-react-native';

const C = {
  bg:         '#0A0F1E',
  surface:    '#111827',
  surfaceAlt: '#1a2235',
  border:     '#1E2D45',
  accent:     '#38BDF8',
  text:       '#F1F5F9',
  muted:      '#64748B',
  danger:     '#F87171',
  success:    '#34D399',
};

const API_BASE_URL = 'http://192.168.1.102:3000';

const members = [
  { name: 'Nine', id: '6634412923', color: C.accent,  bg: '#0c2a3a' },
  { name: 'Fern', id: '6634413523', color: '#A78BFA', bg: '#1e1535' },
  { name: 'Mei',  id: '6634416423', color: C.success, bg: '#0d2a22' },
];

export default function App() {
  const [page, setPage]                         = useState('signup');
  const [user, setUser]                         = useState('');
  const [email, setEmail]                       = useState('');
  const [pass, setPass]                         = useState('');
  const [token, setToken]                       = useState('');
  const [activities, setActivities]             = useState([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showAddModal, setShowAddModal]         = useState(false);
  const [showMenu, setShowMenu]                 = useState(false);
  const [showLogoutModal, setShowLogoutModal]   = useState(false);
  const [toast, setToast]                       = useState('');
  const [toastType, setToastType]               = useState('error');
  const [modalToast, setModalToast]             = useState('');
  const [authLoading, setAuthLoading]           = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [addLoading, setAddLoading]             = useState(false);
  const [deleteLoading, setDeleteLoading]       = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<any>(null);

  const [newActivityName, setNewActivityName]               = useState('');
  const [newActivityDate, setNewActivityDate]               = useState('');
  const [newActivityTime, setNewActivityTime]               = useState('');
  const [newActivityPlace, setNewActivityPlace]             = useState('');
  const [newActivityTag, setNewActivityTag]                 = useState('');
  const [newActivityDescription, setNewActivityDescription] = useState('');

  const isLoggedIn = page !== 'login' && page !== 'signup';
  const goTo = (p: string) => { setPage(p); setShowMenu(false); };
  const clearModalToast = () => setModalToast('');

  const showToast = (msg: string, type = 'error') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (!token) return;
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const normalized = response.data.map((item: any) => {
          const date = item.activity_date ? new Date(item.activity_date) : null;
          return {
            id: item.id,
            activity_date: item.activity_date || '',
            day: date ? String(date.getDate()).padStart(2, '0') : '',
            month: date ? date.toLocaleString('default', { month: 'long' }) : '',
            name: item.activity_name || 'Untitled',
            time: item.activity_time || '',
            place: item.place || '',
            tag: item.tag || 'General',
            description: item.description || '',
          };
        });
        setActivities(normalized);
      } catch (error: any) {
        showToast(error.response?.data?.message || 'Could not load activities');
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, [token]);

  const handleSignup = async () => {
    setAuthLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/users`, { name: user, email, password: pass });
      showToast('Account created. Please sign in.', 'success');
      setPage('login');
      setPass('');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Signup failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/tokens`, { email, password: pass });
      setToken(response.data.token);
      showToast('Login successful', 'success');
      setPage('home');
      setPass('');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    setToken(''); setUser(''); setEmail(''); setPass('');
    setActivities([]);
    goTo('login');
  };

  const resetAddForm = () => {
    setNewActivityName(''); setNewActivityDate(''); setNewActivityTime('');
    setNewActivityPlace(''); setNewActivityTag(''); setNewActivityDescription('');
    setEditingActivityId(null); setModalToast('');
  };

  const openEditActivity = (activity: any) => {
    setSelectedActivity(null);
    setEditingActivityId(activity.id);
    setNewActivityName(activity.name);
    setNewActivityDate(activity.activity_date || '');
    setNewActivityTime(activity.time || '');
    setNewActivityPlace(activity.place || '');
    setNewActivityTag(activity.tag || '');
    setNewActivityDescription(activity.description || '');
    setShowAddModal(true);
  };

  const handleSaveActivity = async () => {
    if (!newActivityName || !newActivityDate || !newActivityTime) {
      setModalToast('Please complete name, date, and time.');
      return;
    }
    setAddLoading(true);
    try {
      const payload = {
        activity_name: newActivityName, activity_date: newActivityDate,
        activity_time: newActivityTime, place: newActivityPlace,
        tag: newActivityTag, description: newActivityDescription,
      };
      const normalize = (item: any) => {
        const date = item.activity_date ? new Date(item.activity_date) : null;
        return {
          id: item.id, activity_date: item.activity_date || '',
          day: date ? String(date.getDate()).padStart(2, '0') : '',
          month: date ? date.toLocaleString('default', { month: 'long' }) : '',
          name: item.activity_name || 'Untitled', time: item.activity_time || '',
          place: item.place || '', tag: item.tag || 'General', description: item.description || '',
        };
      };
      if (editingActivityId) {
        const response = await axios.put(`${API_BASE_URL}/activities/${editingActivityId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities((prev: any) => prev.map((a: any) => a.id === response.data.id ? normalize(response.data) : a));
        showToast('Activity updated.', 'success');
      } else {
        const response = await axios.post(`${API_BASE_URL}/activities`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities((prev: any) => [normalize(response.data), ...prev]);
        showToast('Activity added.', 'success');
      }
      setShowAddModal(false);
      resetAddForm();
    } catch (error: any) {
      setModalToast(error.response?.data?.message || 'Could not save activity');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: any) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities((prev: any) => prev.filter((a: any) => a.id !== activityId));
      setSelectedActivity(null);
      showToast('Activity deleted.', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Could not delete activity');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {toast !== '' && (
        <View style={[s.toast, { backgroundColor: toastType === 'success' ? '#34D399' : C.danger }]}>
          <Text style={s.toastText}>{toast}</Text>
        </View>
      )}

      {isLoggedIn && (
        <View style={s.navbar}>
          <View style={s.navLeft}>
            <Candy size={20} color={C.accent} />
            <Text style={s.navLogo}>TWICE</Text>
          </View>
          <TouchableOpacity style={s.hamburger} onPress={() => setShowMenu(true)}>
            <Menu size={16} color={C.muted} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── HAMBURGER ── */}
      <Modal visible={showMenu} transparent animationType="fade">
        <Pressable style={s.menuOverlay} onPress={() => setShowMenu(false)}>
          <View style={s.menuDropdown}>
            <TouchableOpacity style={s.menuItem} onPress={() => goTo('profile')}>
              <User size={15} color={C.text} /><Text style={s.menuItemText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.menuItem} onPress={() => goTo('credits')}>
              <Users size={15} color={C.text} /><Text style={s.menuItemText}>Credit</Text>
            </TouchableOpacity>
            <View style={s.menuDivider} />
            <TouchableOpacity style={s.menuItem} onPress={() => { setShowMenu(false); setShowLogoutModal(true); }}>
              <LogOut size={15} color={C.danger} /><Text style={[s.menuItemText, { color: C.danger }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ── LOGOUT MODAL ── */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <Pressable style={s.modalOverlay} onPress={() => setShowLogoutModal(false)}>
          <Pressable style={s.modalCard} onPress={() => {}}>
            <Text style={s.modalTitle}>Log Out</Text>
            <Text style={{ color: C.muted, fontSize: 14, marginTop: 8, marginBottom: 24 }}>Are you sure you want to log out?</Text>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowLogoutModal(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={handleLogout}>
                <LogOut size={14} color={C.danger} /><Text style={s.deleteBtnText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── ADD / EDIT MODAL ── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <Pressable style={s.modalOverlay} onPress={() => { setShowAddModal(false); resetAddForm(); }}>
          <Pressable style={s.modalCard} onPress={() => {}}>

            {modalToast !== '' && (
              <View style={s.modalToast}>
                <Text style={s.toastText}>{modalToast}</Text>
              </View>
            )}

            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingActivityId ? 'Edit Activity' : 'Add Activity'}</Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); resetAddForm(); }}>
                <X size={18} color={C.muted} />
              </TouchableOpacity>
            </View>

            <Text style={s.label}>Activity Name</Text>
            <TextInput style={s.input} placeholder="e.g. TWICE World Tour" placeholderTextColor={C.muted}
              value={newActivityName} onChangeText={setNewActivityName} onFocus={clearModalToast} />

            <View style={s.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.label}>Date</Text>
                <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor={C.muted}
                  value={newActivityDate} onChangeText={setNewActivityDate} onFocus={clearModalToast} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Time</Text>
                <TextInput style={s.input} placeholder="HH:MM" placeholderTextColor={C.muted}
                  value={newActivityTime} onChangeText={setNewActivityTime} onFocus={clearModalToast} />
              </View>
            </View>

            <View style={s.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.label}>Place</Text>
                <TextInput style={s.input} placeholder="e.g. Boston, MA" placeholderTextColor={C.muted}
                  value={newActivityPlace} onChangeText={setNewActivityPlace} onFocus={clearModalToast} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Tag</Text>
                <TextInput style={s.input} placeholder="e.g. Concert" placeholderTextColor={C.muted}
                  value={newActivityTag} onChangeText={setNewActivityTag} onFocus={clearModalToast} />
              </View>
            </View>

            <Text style={s.label}>Description</Text>
            <TextInput style={[s.input, s.textarea]} placeholder="Add details, notes, or reminders..."
              placeholderTextColor={C.muted} multiline
              value={newActivityDescription} onChangeText={setNewActivityDescription} onFocus={clearModalToast} />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowAddModal(false); resetAddForm(); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.submitBtn} onPress={handleSaveActivity} disabled={addLoading}>
                {addLoading ? <ActivityIndicator color="#fff" /> : (
                  <><Plus size={14} color="#fff" /><Text style={s.submitBtnText}>{editingActivityId ? 'Update' : 'Add Activity'}</Text></>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── DETAIL MODAL ── */}
      <Modal visible={Boolean(selectedActivity)} transparent animationType="slide">
        <Pressable style={s.modalOverlay} onPress={() => setSelectedActivity(null)}>
          <Pressable style={s.modalCard} onPress={() => {}}>
            {selectedActivity && (
              <>
                <View style={s.modalHeader}>
                  <View style={s.chip}><Text style={s.chipText}>{selectedActivity.tag}</Text></View>
                  <TouchableOpacity onPress={() => setSelectedActivity(null)}><X size={18} color={C.muted} /></TouchableOpacity>
                </View>
                <Text style={s.detailTitle}>{selectedActivity.name}</Text>
                {[
                  { icon: <Calendar size={18} color={C.accent} />, label: 'Date',  value: `${selectedActivity.day} ${selectedActivity.month}` },
                  { icon: <Clock    size={18} color={C.accent} />, label: 'Time',  value: selectedActivity.time },
                  { icon: <MapPin   size={18} color={C.accent} />, label: 'Place', value: selectedActivity.place },
                ].map((item) => (
                  <View key={item.label} style={s.metaItem}>
                    {item.icon}
                    <View>
                      <Text style={s.metaLabel}>{item.label}</Text>
                      <Text style={s.metaValue}>{item.value}</Text>
                    </View>
                  </View>
                ))}
                {selectedActivity.description !== '' && (
                  <View style={s.descBox}>
                    <Text style={s.metaLabel}>Description</Text>
                    <Text style={s.descText}>{selectedActivity.description}</Text>
                  </View>
                )}
                <View style={s.modalActions}>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => handleDeleteActivity(selectedActivity.id)} disabled={deleteLoading}>
                    {deleteLoading ? <ActivityIndicator color={C.danger} /> : (
                      <><Trash2 size={14} color={C.danger} /><Text style={s.deleteBtnText}>Delete</Text></>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={s.submitBtn} onPress={() => openEditActivity(selectedActivity)}>
                    <Pencil size={14} color="#fff" /><Text style={s.submitBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── SIGNUP ── */}
      {page === 'signup' && (
        <ScrollView contentContainerStyle={s.authPage}>
          <View style={s.iconBox}><Candy size={26} color="#fff" /></View>
          <Text style={s.authTitle}>Create Account</Text>
          <Text style={s.authSub}>Sign up to get started.</Text>
          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} placeholder="Enter your email" placeholderTextColor={C.muted} keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Text style={s.label}>Username</Text>
          <TextInput style={s.input} placeholder="Enter your username" placeholderTextColor={C.muted} value={user} onChangeText={setUser} />
          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} placeholder="Enter your password" placeholderTextColor={C.muted} secureTextEntry value={pass} onChangeText={setPass} />
          <TouchableOpacity style={s.loginBtn} onPress={handleSignup} disabled={authLoading}>
            {authLoading ? <ActivityIndicator color="#0A0F1E" /> : <Text style={s.loginBtnText}>Sign Up →</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goTo('login')}>
            <Text style={s.switchText}>Already have an account? <Text style={s.switchLink}>Sign In</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── LOGIN ── */}
      {page === 'login' && (
        <ScrollView contentContainerStyle={s.authPage}>
          <View style={s.iconBox}><Candy size={26} color="#fff" /></View>
          <Text style={s.authTitle}>Welcome</Text>
          <Text style={s.authSub}>Please log in to continue.</Text>
          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} placeholder="Enter your email" placeholderTextColor={C.muted} keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} placeholder="Enter your password" placeholderTextColor={C.muted} secureTextEntry value={pass} onChangeText={setPass} />
          <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={authLoading}>
            {authLoading ? <ActivityIndicator color="#0A0F1E" /> : <Text style={s.loginBtnText}>Login →</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goTo('signup')}>
            <Text style={s.switchText}>Don't have an account? <Text style={s.switchLink}>Sign Up</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ── HOME ── */}
      {page === 'home' && (
        <ScrollView style={s.page} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={s.greeting}>Hello, {user || email}</Text>
          <Text style={s.homeTitle}>Activity, <Text style={{ color: C.accent }}>In coming</Text></Text>
          <View style={s.sectionHeader}>
            <Text style={s.sectionLabel}>All Schedules</Text>
            <TouchableOpacity style={s.addBtn} onPress={() => setShowAddModal(true)}>
              <Plus size={14} color="#0A0F1E" /><Text style={s.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {loadingActivities ? (
            <ActivityIndicator color={C.accent} style={{ marginTop: 24 }} />
          ) : activities.length > 0 ? (
            (activities as any[]).map((a) => (
              <TouchableOpacity key={a.id} style={s.activityCard} onPress={() => setSelectedActivity(a)}>
                <View style={s.dateBox}>
                  <Text style={s.dateDay}>{a.day}</Text>
                  <Text style={s.dateMonth}>{a.month}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.activityName}>{a.name}</Text>
                  <View style={s.activityMeta}>
                    <Clock size={12} color={C.muted} /><Text style={s.metaText}>{a.time}</Text>
                    <MapPin size={12} color={C.muted} /><Text style={s.metaText}>{a.place}</Text>
                  </View>
                </View>
                <View style={s.chip}><Text style={s.chipText}>{a.tag}</Text></View>
                <Text style={s.arrow}>›</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: C.muted, marginTop: 16 }}>No activities yet. Tap Add to create one.</Text>
          )}
        </ScrollView>
      )}

      {/* ── CREDITS ── */}
      {page === 'credits' && (
        <ScrollView style={s.page} contentContainerStyle={{ paddingBottom: 40 }}>
          <TouchableOpacity style={s.backBtn} onPress={() => goTo('home')}>
            <Text style={s.backBtnText}>← Home</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={s.chip}><Text style={s.chipText}>GROUP PROJECT</Text></View>
            <Text style={[s.homeTitle, { marginTop: 12 }]}>Members</Text>
            <Text style={{ color: C.muted, fontSize: 15, marginTop: 4 }}>one in a million</Text>
          </View>
          {members.map((m, i) => (
            <View key={i} style={s.memberCard}>
              <View style={[s.avatar, { backgroundColor: m.bg }]}>
                <Text style={[s.avatarText, { color: m.color }]}>{m.name.charAt(0)}</Text>
              </View>
              <Text style={s.memberName}>{m.name} — {m.id}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── PROFILE ── */}
      {page === 'profile' && (
        <ScrollView style={s.page} contentContainerStyle={{ paddingBottom: 40 }}>
          <TouchableOpacity style={s.backBtn} onPress={() => goTo('home')}>
            <Text style={s.backBtnText}>← Home</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={s.iconBox}><User size={26} color="#fff" /></View>
            <Text style={s.authTitle}>Profile</Text>
          </View>
          <View style={[s.memberCard, { flexDirection: 'column' }]}>
            <View style={s.profileRow}>
              <Text style={s.profileLabel}>Username</Text>
              <Text style={s.profileValue}>{user || '-'}</Text>
            </View>
            <View style={s.profileDivider} />
            <View style={s.profileRow}>
              <Text style={s.profileLabel}>Email</Text>
              <Text style={s.profileValue}>{email || '-'}</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea:       { flex: 1, backgroundColor: C.bg },
  toast:          { position: 'absolute', top: 20, left: 20, right: 20, borderRadius: 10, padding: 14, zIndex: 9999, elevation: 9999, alignItems: 'center' },
  modalToast:     { backgroundColor: C.danger, borderRadius: 10, padding: 12, marginBottom: 16, alignItems: 'center' },
  toastText:      { color: '#fff', fontWeight: '600', fontSize: 14 },
  navbar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.bg },
  navLeft:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navLogo:        { color: C.accent, fontSize: 20, fontWeight: '800' },
  hamburger:      { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  menuOverlay:    { flex: 1 },
  menuDropdown:   { position: 'absolute', top: 70, right: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 6, minWidth: 160, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  menuItem:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  menuItemText:   { color: C.text, fontSize: 14, fontWeight: '500' },
  menuDivider:    { height: 1, backgroundColor: C.border, marginVertical: 4 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalCard:      { backgroundColor: C.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:     { color: C.text, fontSize: 20, fontWeight: '800' },
  modalActions:   { flexDirection: 'row', gap: 12, marginTop: 8 },
  label:          { color: C.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  input:          { backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border, borderRadius: 10, color: C.text, fontSize: 15, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 },
  textarea:       { minHeight: 80, textAlignVertical: 'top' },
  row:            { flexDirection: 'row' },
  loginBtn:       { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 16, backgroundColor: C.accent },
  loginBtnText:   { color: '#0A0F1E', fontSize: 15, fontWeight: '700' },
  submitBtn:      { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.accent, borderRadius: 10, paddingVertical: 13 },
  submitBtnText:  { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelBtn:      { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingVertical: 13 },
  cancelBtnText:  { color: C.muted, fontSize: 15, fontWeight: '600' },
  deleteBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, borderWidth: 1, borderColor: '#F8717144', paddingVertical: 13 },
  deleteBtnText:  { color: C.danger, fontSize: 15, fontWeight: '600' },
  addBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.accent, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  addBtnText:     { color: '#0A0F1E', fontSize: 13, fontWeight: '700' },
  authPage:       { padding: 24, paddingTop: 60 },
  iconBox:        { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 20, backgroundColor: C.accent },
  authTitle:      { color: C.text, fontSize: 28, fontWeight: '800', marginBottom: 4 },
  authSub:        { color: C.muted, fontSize: 14, marginBottom: 28 },
  switchText:     { color: C.muted, fontSize: 14, textAlign: 'center', marginTop: 8 },
  switchLink:     { color: C.accent, fontWeight: '700' },
  page:           { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  greeting:       { color: C.accent, fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  homeTitle:      { color: C.text, fontSize: 32, fontWeight: '800', lineHeight: 38, marginBottom: 28 },
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionLabel:   { color: C.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 },
  activityCard:   { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, marginBottom: 12 },
  dateBox:        { minWidth: 52, alignItems: 'center', backgroundColor: C.surfaceAlt, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 6 },
  dateDay:        { color: C.accent, fontSize: 22, fontWeight: '800', lineHeight: 24 },
  dateMonth:      { color: C.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  activityName:   { color: C.text, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  activityMeta:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText:       { color: C.muted, fontSize: 12 },
  arrow:          { color: C.border, fontSize: 22 },
  chip:           { backgroundColor: '#38BDF822', borderWidth: 1, borderColor: '#38BDF833', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  chipText:       { color: C.accent, fontSize: 11, fontWeight: '700' },
  detailTitle:    { color: C.text, fontSize: 20, fontWeight: '800', marginBottom: 16 },
  metaItem:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surfaceAlt, borderRadius: 10, padding: 12, marginBottom: 10 },
  metaLabel:      { color: C.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  metaValue:      { color: C.text, fontSize: 14, fontWeight: '600', marginTop: 2 },
  descBox:        { backgroundColor: C.surfaceAlt, borderRadius: 10, padding: 14, marginBottom: 4 },
  descText:       { color: '#CBD5E1', fontSize: 14, lineHeight: 22 },
  memberCard:     { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 18, marginBottom: 12 },
  avatar:         { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarText:     { fontSize: 18, fontWeight: '700' },
  memberName:     { color: C.text, fontSize: 15, fontWeight: '600' },
  profileRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  profileLabel:   { color: C.muted, fontSize: 13, fontWeight: '600' },
  profileValue:   { color: C.text, fontSize: 15, fontWeight: '600' },
  profileDivider: { height: 1, backgroundColor: C.border },
  backBtn:        { alignSelf: 'flex-start', marginBottom: 16 },
  backBtnText:    { color: C.accent, fontSize: 14, fontWeight: '600' },
});
