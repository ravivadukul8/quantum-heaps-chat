import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setActiveConversation } from '../conversations/conversationsSlice';
import { toggleGroupInfoDrawer, closeAddMemberModal } from './groupsSlice';
import { GroupInfoDrawer } from './components/GroupInfoDrawer';
import { AddMemberModal } from './components/AddMemberModal';

describe('Group Info Drawer & Member Management Suite', () => {
  const renderGroupComponents = () =>
    render(
      <Provider store={store}>
        <GroupInfoDrawer />
        <AddMemberModal />
      </Provider>
    );

  beforeEach(() => {
    // Select group conversation: conv-6 (#frontend-guild)
    store.dispatch(setActiveConversation('conv-6'));
    store.dispatch(toggleGroupInfoDrawer(true));
    store.dispatch(closeAddMemberModal());
  });

  it('renders group information drawer with members and roles', () => {
    renderGroupComponents();

    expect(screen.getByText('Group Details')).toBeInTheDocument();
    expect(screen.getByText(/#frontend-guild/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Frontend Architecture, React patterns/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/members \(/i)).toBeInTheDocument();
  });

  it('filters member list when typing in member search box', () => {
    renderGroupComponents();

    const searchInput = screen.getByPlaceholderText(/filter members/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Sarah' } });

    expect(screen.getByText(/Sarah Chen/i)).toBeInTheDocument();
    expect(screen.queryByText(/Elena Rostova/i)).not.toBeInTheDocument();
  });

  it('allows opening Add Member modal and adding an eligible contact', async () => {
    renderGroupComponents();

    // Click "Add Member" button
    const addMemberBtn = screen.getByRole('button', { name: /add member/i });
    fireEvent.click(addMemberBtn);

    // Modal opens
    expect(await screen.findByText(/add members to #frontend-guild/i)).toBeInTheDocument();

    // Find an eligible contact not yet in group (Marcus Vance) and select them
    const candidateContact = screen.getByText('Marcus Vance');
    fireEvent.click(candidateContact);

    // Confirm addition
    const addSelectedBtn = screen.getByRole('button', { name: /add selected/i });
    fireEvent.click(addSelectedBtn);

    // Modal closes and Marcus Vance is now in group members
    await waitFor(() => {
      expect(screen.getByText(/Marcus Vance/i)).toBeInTheDocument();
    });
  });

  it('allows an admin to remove a member from the group', async () => {
    renderGroupComponents();

    // Verify Elena Rostova is present
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();

    // Find remove button for Elena Rostova
    const removeElenaBtn = screen.getByLabelText(/remove elena rostova/i);
    fireEvent.click(removeElenaBtn);

    // Member should be removed from the drawer
    await waitFor(() => {
      expect(screen.queryByText('Elena Rostova')).not.toBeInTheDocument();
    });
  });

  it('shows leave group confirmation prompt and handles exit', async () => {
    renderGroupComponents();

    const leaveBtn = screen.getByRole('button', { name: /leave group/i });
    fireEvent.click(leaveBtn);

    // Confirmation alert shown
    expect(screen.getByText(/are you sure you want to leave this group\?/i)).toBeInTheDocument();

    // Confirm leaving
    const confirmLeave = screen.getAllByRole('button', { name: /leave group/i });
    fireEvent.click(confirmLeave[confirmLeave.length - 1]!);

    await waitFor(() => {
      // Active conversation becomes null or drawer closes
      expect(screen.queryByText('Group Details')).not.toBeInTheDocument();
    });
  });
});
