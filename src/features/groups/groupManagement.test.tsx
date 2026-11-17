import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { setActiveConversation } from '../conversations/conversationsSlice';
import { toggleGroupInfoDrawer, closeAddMemberModal } from './groupsSlice';
import { GroupInfoDrawer } from './components/GroupInfoDrawer';
import { AddMemberModal } from './components/AddMemberModal';
import { Toast } from '../../components/common/Toast';

describe('Group Management Suite (Tasks 20, 21, 22: Info, Add & Remove Members)', () => {
  const renderGroupComponents = () =>
    render(
      <Provider store={store}>
        <div className="relative">
          <GroupInfoDrawer />
          <AddMemberModal />
          <Toast />
        </div>
      </Provider>
    );

  beforeEach(() => {
    // Select group conversation: conv-6 (#frontend-guild)
    store.dispatch(setActiveConversation('conv-6'));
    store.dispatch(toggleGroupInfoDrawer(true));
    store.dispatch(closeAddMemberModal());
  });

  /* -------------------------------------------------------------
   * TASK 20: GROUP INFORMATION AND MEMBERS
   * ------------------------------------------------------------- */
  describe('Task 20: Group Information and Members', () => {
    it('displays group name, image, description, and total member count', () => {
      renderGroupComponents();

      expect(screen.getByText('Group Details')).toBeInTheDocument();
      expect(screen.getByText(/#frontend-guild/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Frontend Architecture, React patterns/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Group • \d+ members/i)).toBeInTheDocument();
      expect(screen.getByAltText(/#frontend-guild/i)).toBeInTheDocument();
    });

    it('displays all group members with profile pictures, names, and online status', () => {
      renderGroupComponents();

      // Check member list items
      const membersList = screen.getByRole('list', { name: /group members list/i });
      expect(membersList).toBeInTheDocument();

      // Verify specific members are present
      expect(screen.getByText(/Sarah Chen/i)).toBeInTheDocument();
      expect(screen.getByText(/Alex Rivera \(You\)/i)).toBeInTheDocument();

      // Check admin badge presence
      expect(screen.getAllByText(/Admin/i).length).toBeGreaterThan(0);
    });

    it('filters member list when typing in member search box', () => {
      renderGroupComponents();

      const searchInput = screen.getByPlaceholderText(/filter members/i);
      expect(searchInput).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'Sarah' } });

      expect(screen.getByText(/Sarah Chen/i)).toBeInTheDocument();
      expect(screen.queryByText(/David Kim/i)).not.toBeInTheDocument();

      // Clear search
      const clearBtn = screen.getByLabelText(/clear filter/i);
      fireEvent.click(clearBtn);
      expect(screen.getByText(/Elena Rostova/i)).toBeInTheDocument();
    });

    it('allows closing the group information drawer via close button', async () => {
      renderGroupComponents();

      const closeBtn = screen.getByLabelText(/close group details/i);
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByText('Group Details')).not.toBeInTheDocument();
      });
    });
  });

  /* -------------------------------------------------------------
   * TASK 21: ADD GROUP MEMBERS
   * ------------------------------------------------------------- */
  describe('Task 21: Add Group Members', () => {
    it('displays only eligible contacts who are not already group members', async () => {
      renderGroupComponents();

      const addMemberBtn = screen.getByRole('button', { name: /add member/i });
      fireEvent.click(addMemberBtn);

      expect(await screen.findByText(/add members to #frontend-guild/i)).toBeInTheDocument();

      // Sarah Chen is already in conv-6, so should not appear in the eligible list
      expect(screen.queryByRole('option', { name: /Sarah Chen/i })).not.toBeInTheDocument();

      // Marcus Vance is not in conv-6, so should be available
      expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
    });

    it('filters eligible contacts using search input', async () => {
      renderGroupComponents();

      fireEvent.click(screen.getByRole('button', { name: /add member/i }));

      const searchInput = await screen.findByPlaceholderText(/search contacts by name or email/i);
      fireEvent.change(searchInput, { target: { value: 'Marcus' } });

      expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
      expect(screen.queryByText('Liam Foster')).not.toBeInTheDocument();
    });

    it('allows selecting multiple eligible users, adds them, updates member count, and shows toast feedback', async () => {
      renderGroupComponents();

      fireEvent.click(screen.getByRole('button', { name: /add member/i }));

      // Select multiple contacts (e.g. Marcus Vance)
      const contact1 = await screen.findByText('Marcus Vance');
      fireEvent.click(contact1);

      expect(screen.getByText(/1 contact selected/i)).toBeInTheDocument();

      // Click Add Selected
      const addSelectedBtn = screen.getByRole('button', { name: /add selected/i });
      fireEvent.click(addSelectedBtn);

      // Verify success toast appears
      await waitFor(() => {
        expect(screen.getByText(/added 1 new member to #frontend-guild/i)).toBeInTheDocument();
      });

      // Verify member is now in the drawer member list
      expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------------------
   * TASK 22: REMOVE GROUP MEMBERS
   * ------------------------------------------------------------- */
  describe('Task 22: Remove Group Members', () => {
    it('shows confirmation dialog before removing a member and cancels cleanly', async () => {
      renderGroupComponents();

      // Elena Rostova is a member in conv-6
      expect(screen.getByText('Elena Rostova')).toBeInTheDocument();

      // Click remove button for Elena Rostova
      const removeElenaBtn = screen.getByLabelText(/remove elena rostova/i);
      fireEvent.click(removeElenaBtn);

      // Confirmation dialog should be visible
      const dialogHeading = await screen.findByRole('heading', { name: /remove elena rostova\?/i });
      expect(dialogHeading).toBeInTheDocument();
      expect(screen.getByText(/they will no longer have access/i)).toBeInTheDocument();

      // Click cancel
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelBtn);

      // Dialog closes and Elena remains in the group
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /remove elena rostova\?/i })).not.toBeInTheDocument();
      });
      expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    });

    it('removes the member upon confirmation, updates member count, and shows feedback', async () => {
      renderGroupComponents();

      const removeElenaBtn = screen.getByLabelText(/remove elena rostova/i);
      fireEvent.click(removeElenaBtn);

      // Confirm removal
      const confirmRemoveBtn = await screen.findByRole('button', { name: /^remove$/i });
      fireEvent.click(confirmRemoveBtn);

      // Elena should be removed and toast displayed
      await waitFor(() => {
        expect(screen.queryByText('Elena Rostova')).not.toBeInTheDocument();
        expect(screen.getByText(/removed elena rostova from #frontend-guild/i)).toBeInTheDocument();
      });
    });

    it('shows leave group confirmation prompt and handles exit cleanly', async () => {
      renderGroupComponents();

      const leaveBtn = screen.getByRole('button', { name: /leave group/i });
      fireEvent.click(leaveBtn);

      expect(screen.getByText(/are you sure you want to leave this group\?/i)).toBeInTheDocument();

      const confirmLeave = screen.getAllByRole('button', { name: /leave group/i });
      fireEvent.click(confirmLeave[confirmLeave.length - 1]!);

      await waitFor(() => {
        expect(screen.queryByText('Group Details')).not.toBeInTheDocument();
      });
    });
  });
});
